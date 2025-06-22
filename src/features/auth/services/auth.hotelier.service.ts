import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import config from "../../../app/config";
import CustomError from "../../../utils/lib/customError";
import Lib from "../../../utils/lib/lib";
import {
  LOGIN_TOKEN_EXPIRES_IN,
  PROJECT_NAME,
  USER_AUTHENTICATION_VIEW,
  USER_STATUS,
  USER_TYPE,
} from "../../../utils/miscellaneous/constants";
import {
  IForgetPasswordPayload,
  NotificationTypeEnum,
} from "../../../utils/modelTypes/common/commonModelTypes";
import { TypeUser } from "../../../utils/modelTypes/user/userModelTypes";
import { registrationHotelierTemplate } from "../../../utils/templates/registrationHotelierTemplate";

export default class HotelierAuthService extends AbstractServices {
  constructor() {
    super();
  }

  public async organizationRegistrationService(req: Request) {
    return this.db.transaction(async (trx) => {
      const files = (req.files as Express.Multer.File[]) || [];

      const { designation, ...user } = Lib.safeParseJSON(req.body.user);
      const organization = Lib.safeParseJSON(req.body.organization);
      const organizationAddress = Lib.safeParseJSON(
        req.body.organization_address
      );
      const amenitiesInput =
        Lib.safeParseJSON(req.body.organization_amenities) || [];

      for (const file of files) {
        if (file.fieldname === "photo") {
          user.photo = file.filename;
        }
      }

      const { email, phone_number, username, password, ...userData } = user;

      const userModel = this.Model.UserModel(trx);
      const organizationModel = this.Model.organizationModel(trx);
      const commonModel = this.Model.commonModel(trx);

      const [existingUser] = await userModel.checkUser({
        email,
        phone_number,
        username,
        type: USER_TYPE.HOTELIER,
      });

      if (existingUser) {
        if (existingUser.email === email) {
          return {
            success: false,
            code: this.StatusCode.HTTP_BAD_REQUEST,
            message: this.ResMsg.EMAIL_ALREADY_EXISTS,
          };
        }
        // if (existingUser.username === username) {
        //   return {
        //     success: false,
        //     code: this.StatusCode.HTTP_BAD_REQUEST,
        //     message: this.ResMsg.USERNAME_ALREADY_EXISTS,
        //   };
        // }
        if (existingUser.phone_number === phone_number) {
          return {
            success: false,
            code: this.StatusCode.HTTP_BAD_REQUEST,
            message: this.ResMsg.PHONE_NUMBER_ALREADY_EXISTS,
          };
        }
      }

      const password_hash = await Lib.hashValue(password);

      const registration = await userModel.createUser({
        ...userData,
        email,
        phone_number,
        username,
        password_hash,
        type: USER_TYPE.HOTELIER,
      });

      if (!registration.length) {
        throw new CustomError(
          this.ResMsg.HTTP_BAD_REQUEST,
          this.StatusCode.HTTP_BAD_REQUEST,
          "ERROR"
        );
      }

      const organization_location = await commonModel.createLocation(
        organizationAddress
      );
      const locationId = organization_location[0].id;
      const userId = registration[0].id;

      await userModel.createUserMaintenanceDesignation({
        designation,
        user_id: userId,
      });
      const orgInsert = await organizationModel.createOrganization({
        ...organization,
        user_id: userId,
        location_id: locationId,
      });

      const organizationId = orgInsert[0].id;

      const photos = files.map((file) => ({
        organization_id: organizationId,
        file: file.filename,
      }));

      if (photos.length) {
        await organizationModel.addPhoto(photos);
      }

      const amenities = amenitiesInput.map((a: string) => ({
        organization_id: organizationId,
        amenity: a,
      }));

      if (amenities.length) {
        await organizationModel.addAmenities(amenities);
      }

      const tokenData = {
        user_id: userId,
        username,
        name: user.name,
        user_email: email,
        phone_number,
        photo: user.photo,
        status: true,
        create_date: new Date(),
      };
      await this.insertNotification(trx, TypeUser.ADMIN, {
        user_id: userId,
        content: `New hotelier "${user.name}" (${username}) has registered and is awaiting verification.`,
        related_id: userId,
        type: NotificationTypeEnum.HOTELIER_VERIFICATION,
      });
      await Lib.sendEmailDefault({
        email,
        emailSub: `Your organization registration with ${PROJECT_NAME} is under review`,
        emailBody: registrationHotelierTemplate({ name: user.name }),
      });

      const token = Lib.createToken(
        tokenData,
        config.JWT_SECRET_HOTEL,
        LOGIN_TOKEN_EXPIRES_IN
      );

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: this.ResMsg.HTTP_SUCCESSFUL,
        data: tokenData,
        token,
      };
    });
  }

  // login
  public async loginService(req: Request) {
    const { email, password } = req.body as { email: string; password: string };
    const userModel = this.Model.UserModel();
    const checkUser = await userModel.getSingleCommonAuthUser({
      schema_name: "hotelier",
      table_name: USER_AUTHENTICATION_VIEW.HOTELIER,
      email,
    });

    if (!checkUser) {
      return {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: this.ResMsg.WRONG_CREDENTIALS,
      };
    }

    const { password_hash: hashPass, ...rest } = checkUser;
    const checkPass = await Lib.compareHashValue(password, hashPass);

    if (!checkPass) {
      return {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: this.ResMsg.WRONG_CREDENTIALS,
      };
    }

    if (rest.organization_status !== USER_STATUS.ACTIVE) {
      return {
        success: false,
        code: this.StatusCode.HTTP_FORBIDDEN,
        message: `Account Inactive: Your account status is '${rest.organization_status}'. Please contact ${PROJECT_NAME} support to activate your account.`,
      };
    }

    if (rest.is_2fa_on) {
      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.LOGIN_SUCCESSFUL,
        data: {
          email: rest.email,
          is_2fa_on: true,
        },
      };
    } else {
      const token_data = {
        user_id: rest.user_id,
        username: rest.username,
        name: rest.name,
        gender: rest.gender,
        phone_number: rest.phone_number,
        role_id: rest.role_id,
        photo: rest.photo,
        status: rest.user_status,
        email: rest.email,
        organization_status: rest.organization_status,
      };

      const token = Lib.createToken(
        token_data,
        config.JWT_SECRET_HOTEL,
        LOGIN_TOKEN_EXPIRES_IN
      );
      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.LOGIN_SUCCESSFUL,
        data: rest,
        token,
      };
    }
  }

  // loginData for 2FA user info retrieval
  public async loginData(req: Request) {
    const { token, email } = req.body as { token: string; email: string };
    const token_verify: any = Lib.verifyToken(token, config.JWT_SECRET_HOTEL);
    const user_model = this.Model.UserModel();

    if (!token_verify) {
      return {
        success: false,
        code: this.StatusCode.HTTP_UNAUTHORIZED,
        message: this.ResMsg.HTTP_UNAUTHORIZED,
      };
    }

    const { email: verify_email } = token_verify;
    if (email === verify_email) {
      const checkUser = await user_model.getSingleCommonAuthUser({
        schema_name: "hotelier",
        table_name: USER_AUTHENTICATION_VIEW.HOTELIER,
        email,
      });

      console.log({ checkUser });

      if (!checkUser) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: this.ResMsg.WRONG_CREDENTIALS,
        };
      }

      const { password_hash: hashPass, ...rest } = checkUser;

      if (rest.organization_status !== USER_STATUS.ACTIVE) {
        return {
          success: false,
          code: this.StatusCode.HTTP_FORBIDDEN,
          message: `Account Inactive: Your account status is '${rest.organization_status}'. Please contact ${PROJECT_NAME} support to activate your account.`,
        };
      }

      const token_data = {
        user_id: rest.user_id,
        username: rest.username,
        name: rest.name,
        gender: rest.gender,
        phone_number: rest.phone_number,
        role_id: rest.role_id,
        photo: rest.photo,
        status: rest.user_status,
        email: rest.email,
        organization_status: rest.organization_status,
      };

      const token = Lib.createToken(
        token_data,
        config.JWT_SECRET_HOTEL,
        LOGIN_TOKEN_EXPIRES_IN
      );
      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.LOGIN_SUCCESSFUL,
        data: token_data,
        token,
      };
    } else {
      return {
        success: false,
        code: this.StatusCode.HTTP_FORBIDDEN,
        message: this.StatusCode.HTTP_FORBIDDEN,
      };
    }
  }

  //forget pass
  public async forgetPassword(req: Request) {
    const { token, email, password } = req.body as IForgetPasswordPayload;
    const token_verify: any = Lib.verifyToken(token, config.JWT_SECRET_HOTEL);

    if (!token_verify) {
      return {
        success: false,
        code: this.StatusCode.HTTP_UNAUTHORIZED,
        message: this.ResMsg.HTTP_UNAUTHORIZED,
      };
    }

    const { email: verify_email } = token_verify;
    if (email === verify_email) {
      const hashed_pass = await Lib.hashValue(password);
      const model = this.Model.UserModel();
      const [get_user] = await model.checkUser({
        email,
        type: USER_TYPE.HOTELIER,
      });
      await model.updateProfile(
        { password_hash: hashed_pass },
        { id: get_user.id }
      );
      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.PASSWORD_CHANGED,
      };
    } else {
      return {
        success: false,
        code: this.StatusCode.HTTP_FORBIDDEN,
        message: this.StatusCode.HTTP_FORBIDDEN,
      };
    }
  }
}
