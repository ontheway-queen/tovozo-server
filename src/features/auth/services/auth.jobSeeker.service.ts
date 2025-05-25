import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import {
  PROJECT_NAME,
  USER_AUTHENTICATION_VIEW,
  USER_STATUS,
  USER_TYPE,
} from "../../../utils/miscellaneous/constants";
import Lib from "../../../utils/lib/lib";
import config from "../../../app/config";
import { IForgetPasswordPayload } from "../../../utils/modelTypes/common/commonModelTypes";

class JobSeekerAuthService extends AbstractServices {
  //registration service
  public async registrationService(req: Request) {
    return this.db.transaction(async (trx) => {
      const files = (req.files as Express.Multer.File[]) || [];

      if (files?.length) {
        req.body[files[0].fieldname] = files[0].filename;
      }

      const { password, email, phone_number, username, ...rest } = req.body;

      const userModel = this.Model.UserModel(trx);
      const check_user = await userModel.checkUser({
        email,
        phone_number,
        username,
        type: USER_TYPE.JOB_SEEKER,
      });

      if (check_user) {
        if (check_user.email === email) {
          return {
            success: false,
            code: this.StatusCode.HTTP_BAD_REQUEST,
            message: this.ResMsg.EMAIL_ALREADY_EXISTS,
          };
        } else if (check_user.username === username) {
          return {
            success: false,
            code: this.StatusCode.HTTP_BAD_REQUEST,
            message: this.ResMsg.USERNAME_ALREADY_EXISTS,
          };
        } else if (check_user.phone_number === phone_number) {
          return {
            success: false,
            code: this.StatusCode.HTTP_BAD_REQUEST,
            message: this.ResMsg.PHONE_NUMBER_ALREADY_EXISTS,
          };
        }
      }
      rest.email = email;
      rest.phone_number = phone_number;
      rest.username = username;
      //password hashing
      const hashedPass = await Lib.hashValue(password);
      //register user
      const registration = await userModel.createUser({
        password_hash: hashedPass,
        ...rest,
      });

      //retrieve token data
      const tokenData = {
        user_id: registration[0].id,
        username: rest.username,
        name: rest.name,
        gender: rest.gender,
        user_email: rest.email,
        phone_number: rest.phone_number,
        photo: rest.photo,
        status: true,
        create_date: new Date(),
      };

      const token = Lib.createToken(
        tokenData,
        config.JWT_SECRET_JOB_SEEKER,
        "48h"
      );

      if (registration.length) {
        return {
          success: true,
          code: this.StatusCode.HTTP_SUCCESSFUL,
          message: this.ResMsg.HTTP_SUCCESSFUL,
          data: { ...tokenData },
          token,
        };
      } else {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: this.ResMsg.HTTP_BAD_REQUEST,
        };
      }
    });
  }

  //login
  public async loginService(req: Request) {
    const { email, password } = req.body as { email: string; password: string };
    const userModel = this.Model.UserModel();
    const checkUser = await userModel.getSingleCommonAuthUser({
      schema_name: "job_seeker",
      table_name: USER_AUTHENTICATION_VIEW.JOB_SEEKER,
      email,
    });
    if (!checkUser) {
      return {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: this.ResMsg.WRONG_CREDENTIALS,
      };
    }

    const { password_hash: hashPass, ...rest } = checkUser[0];
    const checkPass = await Lib.compareHashValue(password, hashPass);

    if (!checkPass) {
      return {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: this.ResMsg.WRONG_CREDENTIALS,
      };
    }

    if (rest.account_status !== USER_STATUS.ACTIVE) {
      return {
        success: false,
        code: this.StatusCode.HTTP_FORBIDDEN,
        message: `Account Inactive: Your account status is '${rest.account_status}'. Please contact ${PROJECT_NAME} support to activate your account.`,
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
        id: rest.id,
        username: rest.username,
        first_name: rest.first_name,
        last_name: rest.last_name,
        gender: rest.gender,
        phone_number: rest.phone_number,
        role_id: rest.role_id,
        photo: rest.photo,
        status: rest.status,
        email: rest.email,
      };

      const token = Lib.createToken(
        token_data,
        config.JWT_SECRET_JOB_SEEKER,
        "48h"
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

  // The loginData is used to retrieve user information after successfully verifying the user through two-factor authentication.
  public async LoginData(req: Request) {
    const { token, email } = req.body as { token: string; email: string };
    const token_verify: any = Lib.verifyToken(
      token,
      config.JWT_SECRET_JOB_SEEKER
    );
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
      const model = this.Model.UserModel();
      const checkUser = await user_model.getSingleCommonAuthUser({
        schema_name: "job_seeker",
        table_name: USER_AUTHENTICATION_VIEW.JOB_SEEKER,
        email,
      });
      if (!checkUser) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: this.ResMsg.WRONG_CREDENTIALS,
        };
      }

      const { hashed_password: hashPass, agency_id, ...rest } = checkUser[0];

      if (rest.account_status !== USER_STATUS.ACTIVE) {
        return {
          success: false,
          code: this.StatusCode.HTTP_FORBIDDEN,
          message: `Account Inactive: Your account status is '${rest.account_status}'. Please contact ${PROJECT_NAME} support to activate your account.`,
        };
      }

      const token_data = {
        id: rest.id,
        username: rest.username,
        first_name: rest.first_name,
        last_name: rest.last_name,
        gender: rest.gender,
        phone_number: rest.phone_number,
        role_id: rest.role_id,
        photo: rest.photo,
        status: rest.status,
        email: rest.email,
      };

      const token = Lib.createToken(
        token_data,
        config.JWT_SECRET_JOB_SEEKER,
        "48h"
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
    const token_verify: any = Lib.verifyToken(
      token,
      config.JWT_SECRET_JOB_SEEKER
    );

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
      const get_user = await model.checkUser({
        email,
        type: USER_TYPE.JOB_SEEKER,
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

export default JobSeekerAuthService;
