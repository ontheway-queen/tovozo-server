import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import config from "../../../app/config";
import CustomError from "../../../utils/lib/customError";
import Lib from "../../../utils/lib/lib";
import {
  BRITISH_ID,
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
import { registrationJobSeekerTemplate } from "../../../utils/templates/jobSeekerRegistrationTemplate";

class JobSeekerAuthService extends AbstractServices {
  //registration service
  public async registrationService(req: Request) {
    return this.db.transaction(async (trx) => {
      const files = (req.files as Express.Multer.File[]) || [];

      const parseInput = (key: string) =>
        Lib.safeParseJSON(req.body[key]) || {};

      const userInput = parseInput("user");
      const jobSeekerInput = parseInput("job_seeker");
      // const jobPreferencesInput = parseInput("job_preferences");
      // const jobLocationsInput = parseInput("job_locations");
      // const ownAddressInput = parseInput("own_address");
      // const jobShiftingInput = parseInput("job_shifting");
      const jobSeekerInfoInput = parseInput("job_seeker_info");

      // const validFileFields = ["visa_copy", "passport_copy", "resume", "photo"];

      // Attach file references
      files.forEach(({ fieldname, filename }) => {
        // if (!validFileFields.includes(fieldname)) {
        //   throw new CustomError(
        //     this.ResMsg.UNKNOWN_FILE_FIELD,
        //     this.StatusCode.HTTP_BAD_REQUEST,
        //     "ERROR"
        //   );
        // }

        if (fieldname === "photo") {
          userInput.photo = filename;
        } else {
          // console.log({ filename, fieldname });
          if (jobSeekerInput.nationality === BRITISH_ID) {
            if (fieldname !== "id_copy") {
              throw new CustomError(
                "id_copy required for British Nationality",
                this.StatusCode.HTTP_BAD_REQUEST
              );
            }
          } else {
            if (fieldname !== "visa_copy") {
              throw new CustomError(
                "visa_copy required for British Nationality",
                this.StatusCode.HTTP_BAD_REQUEST
              );
            }
          }
          jobSeekerInfoInput[fieldname] = filename;
        }
      });

      const { email, phone_number, username, password, ...restUserData } =
        userInput;

      const userModel = this.Model.UserModel(trx);
      const jobSeekerModel = this.Model.jobSeekerModel(trx);
      // const commonModel = this.Model.commonModel(trx);

      const existingUser = await userModel.checkUser({
        email,
        phone_number,
        username,
        type: USER_TYPE.JOB_SEEKER,
      });
      if (existingUser && existingUser.length) {
        for (const user of existingUser) {
          if (user.email === email) {
            return {
              success: false,
              code: this.StatusCode.HTTP_BAD_REQUEST,
              message: this.ResMsg.EMAIL_ALREADY_EXISTS,
            };
          }
          // if (user.username === username) {
          //   return {
          //     success: false,
          //     code: this.StatusCode.HTTP_BAD_REQUEST,
          //     message: this.ResMsg.USERNAME_ALREADY_EXISTS,
          //   };
          // }
          if (user.phone_number === phone_number) {
            return {
              success: false,
              code: this.StatusCode.HTTP_BAD_REQUEST,
              message: this.ResMsg.PHONE_NUMBER_ALREADY_EXISTS,
            };
          }
        }
      }

      const password_hash = await Lib.hashValue(password);

      const registration = await userModel.createUser({
        ...restUserData,
        email,
        phone_number,
        username,
        password_hash,
        type: USER_TYPE.JOB_SEEKER,
      });

      if (!registration.length) {
        throw new CustomError(
          this.ResMsg.HTTP_BAD_REQUEST,
          this.StatusCode.HTTP_BAD_REQUEST,
          "ERROR"
        );
      }

      // const [ownAddressId] = await commonModel.createLocation({
      //   ...ownAddressInput,
      //   is_home_address: true,
      // });

      const jobSeekerId = registration[0].id;

      // console.log({ jobSeekerId, ownAddressId: ownAddressId.id });

      await jobSeekerModel.createJobSeeker({
        ...jobSeekerInput,
        // location_id: ownAddressId.id,
        user_id: jobSeekerId,
      });

      // const createdLocations = await commonModel.createLocation(
      //   jobLocationsInput
      // );
      // const preferenceLocationIds = [
      //   ...createdLocations.map((loc) => loc.id),
      //   ownAddressId.id,
      // ];

      // const jobPreferences = jobPreferencesInput.map((job_id: number) => ({
      //   job_seeker_id: jobSeekerId,
      //   job_id,
      // }));

      // const jobLocations = preferenceLocationIds.map((location_id: number) => ({
      //   job_seeker_id: jobSeekerId,
      //   location_id,
      // }));

      // const jobShifts = jobShiftingInput.map((shift: string) => ({
      //   job_seeker_id: jobSeekerId,
      //   shift,
      // }));

      // await Promise.all([
      //   jobSeekerModel.setJobPreferences(jobPreferences),
      //   jobSeekerModel.setJobLocations(jobLocations),
      //   jobSeekerModel.setJobShifting(jobShifts),
      // ]);

      await jobSeekerModel.createJobSeekerInfo({
        ...jobSeekerInfoInput,
        job_seeker_id: jobSeekerId,
      });

      const tokenPayload = {
        user_id: jobSeekerId,
        username,
        name: userInput.name,
        gender: userInput.gender,
        user_email: email,
        phone_number,
        photo: userInput.photo,
        status: true,
        create_date: new Date(),
      };

      await this.insertNotification(trx, TypeUser.ADMIN, {
        user_id: jobSeekerId,
        content: `New job seeker "${userInput.name}" (${username}) has registered and is awaiting verification.`,
        related_id: jobSeekerId,
        type: NotificationTypeEnum.JOB_SEEKER_VERIFICATION,
      });

      await Lib.sendEmailDefault({
        email,
        emailSub: `Your registration with ${PROJECT_NAME} is under review`,
        emailBody: registrationJobSeekerTemplate({ name: userInput.name }),
      });

      const token = Lib.createToken(
        tokenPayload,
        config.JWT_SECRET_JOB_SEEKER,
        LOGIN_TOKEN_EXPIRES_IN
      );

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: this.ResMsg.HTTP_SUCCESSFUL,
        data: tokenPayload,
        token,
      };
    });
  }

  //login
  public async loginService(req: Request) {
    const { email, password } = req.body as { email: string; password: string };
    const userModel = this.Model.UserModel();
    const checkUser = await userModel.getSingleCommonAuthUser({
      schema_name: "jobseeker",
      table_name: USER_AUTHENTICATION_VIEW.JOB_SEEKER,
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
        user_id: rest.user_id,
        username: rest.username,
        name: rest.name,
        gender: rest.gender,
        phone_number: rest.phone_number,
        role_id: rest.role_id,
        photo: rest.photo,
        status: rest.user_status,
        email: rest.email,
        account_status: rest.account_status,
      };

      const token = Lib.createToken(
        token_data,
        config.JWT_SECRET_JOB_SEEKER,
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
      const checkUser = await user_model.getSingleCommonAuthUser({
        schema_name: "jobseeker",
        table_name: USER_AUTHENTICATION_VIEW.JOB_SEEKER,
        email,
      });

      console.log({ checkUser });

      console.log({ checkUser });

      if (!checkUser) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: this.ResMsg.WRONG_CREDENTIALS,
        };
      }

      const { password_hash: hashPass, agency_id, ...rest } = checkUser;

      if (rest.account_status !== USER_STATUS.ACTIVE) {
        return {
          success: false,
          code: this.StatusCode.HTTP_FORBIDDEN,
          message: `Account Inactive: Your account status is '${rest.account_status}'. Please contact ${PROJECT_NAME} support to activate your account.`,
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
        account_status: rest.account_status,
      };

      const token = Lib.createToken(
        token_data,
        config.JWT_SECRET_JOB_SEEKER,
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
      const [get_user] = await model.checkUser({
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
