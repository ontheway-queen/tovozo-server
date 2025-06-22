import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import config from "../../../app/config";
import Lib from "../../../utils/lib/lib";

import {
  OTP_EMAIL_SUBJECT,
  OTP_FOR,
  OTP_TYPE_FORGET_ADMIN,
  OTP_TYPE_FORGET_HOTELIER,
  OTP_TYPE_FORGET_JOB_SEEKER,
  OTP_TYPE_TWO_FA_ADMIN,
  OTP_TYPE_TWO_FA_HOTELIER,
  OTP_TYPE_TWO_FA_JOB_SEEKER,
  OTP_TYPE_VERIFY_HOTELIER,
  OTP_TYPE_VERIFY_JOB_SEEKER,
  USER_AUTHENTICATION_VIEW,
} from "../../../utils/miscellaneous/constants";
import { IGetOTPPayload } from "../../../utils/modelTypes/common/commonModelTypes";
import { sendEmailOtpTemplate } from "../../../utils/templates/sendEmailOtpTemplate";

class PublicService extends AbstractServices {
  constructor() {
    super();
  }

  //send email otp service
  public async sendOtpToEmailService(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { email, type } = req.body as IGetOTPPayload;
      if (type === OTP_TYPE_FORGET_JOB_SEEKER) {
        // --check if the user exist
        const userModel = this.Model.UserModel();
        const checkUser = await userModel.getSingleCommonAuthUser({
          email,
          schema_name: "jobseeker",
          table_name: USER_AUTHENTICATION_VIEW.JOB_SEEKER,
        });
        if (!checkUser) {
          return {
            success: false,
            code: this.StatusCode.HTTP_NOT_FOUND,
            message: "No user has been found with this email",
          };
        }
      } else if (type === OTP_TYPE_FORGET_ADMIN) {
        const model = this.Model.UserModel(trx);
        const admin_details = await model.getSingleCommonAuthUser({
          email,
          schema_name: "admin",
          table_name: USER_AUTHENTICATION_VIEW.ADMIN,
        });
        if (!admin_details) {
          return {
            success: false,
            code: this.StatusCode.HTTP_NOT_FOUND,
            message: this.ResMsg.NOT_FOUND_USER_WITH_EMAIL,
          };
        }
      } else if (type === (OTP_TYPE_VERIFY_JOB_SEEKER as typeof type)) {
        const userModel = this.Model.UserModel();
        const checkUser = await userModel.getSingleCommonAuthUser({
          email,
          schema_name: "jobseeker",
          table_name: USER_AUTHENTICATION_VIEW.JOB_SEEKER,
        });

        if (checkUser) {
          return {
            success: false,
            code: this.StatusCode.HTTP_CONFLICT,
            message: "Email already exists!",
          };
        }
      } else if (type === (OTP_TYPE_VERIFY_HOTELIER as typeof type)) {
        const userModel = this.Model.UserModel();
        const checkUser = await userModel.getSingleCommonAuthUser({
          email,
          schema_name: "hotelier",
          table_name: USER_AUTHENTICATION_VIEW.HOTELIER,
        });

        if (checkUser) {
          return {
            success: false,
            code: this.StatusCode.HTTP_CONFLICT,
            message: "Email already exists!",
          };
        }
      } else if (type === OTP_TYPE_FORGET_HOTELIER) {
        // --check if the user exist
        const userModel = this.Model.UserModel();
        const checkUser = await userModel.getSingleCommonAuthUser({
          email,
          schema_name: "hotelier",
          table_name: USER_AUTHENTICATION_VIEW.HOTELIER,
        });

        if (!checkUser) {
          return {
            success: false,
            code: this.StatusCode.HTTP_NOT_FOUND,
            message: "No user found.",
          };
        }
      } else if (type === (OTP_TYPE_TWO_FA_JOB_SEEKER as typeof type)) {
        const userModel = this.Model.UserModel();
        const checkAgent = await userModel.getSingleCommonAuthUser({
          email,
          schema_name: "jobseeker",
          table_name: USER_AUTHENTICATION_VIEW.JOB_SEEKER,
        });
        if (!checkAgent) {
          return {
            success: false,
            code: this.StatusCode.HTTP_NOT_FOUND,
            message: "No user found.",
          };
        }
      }

      const commonModel = this.Model.commonModel(trx);
      const checkOtp = await commonModel.getOTP({ email: email, type: type });

      if (checkOtp.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_GONE,
          message: this.ResMsg.THREE_TIMES_EXPIRED,
        };
      }

      const otp = Lib.otpGenNumber(6);
      const hashed_otp = await Lib.hashValue(otp);

      try {
        const [send_email] = await Promise.all([
          email
            ? Lib.sendEmailDefault({
                email,
                emailSub: OTP_EMAIL_SUBJECT,
                emailBody: sendEmailOtpTemplate(otp, OTP_FOR),
              })
            : undefined,
        ]);

        if (send_email) {
          await commonModel.insertOTP({
            hashed_otp: hashed_otp,
            email: email,
            type: type,
          });

          return {
            success: true,
            code: this.StatusCode.HTTP_OK,
            message: this.ResMsg.OTP_SENT,
            data: {
              email,
            },
          };
        } else {
          return {
            success: false,
            code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
            message: this.ResMsg.HTTP_INTERNAL_SERVER_ERROR,
          };
        }
      } catch (error) {
        console.error("Error sending email or SMS:", error);
        return {
          success: false,
          code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
          message: this.ResMsg.HTTP_INTERNAL_SERVER_ERROR,
        };
      }
    });
  }

  //match email otp service
  public async matchEmailOtpService(req: Request) {
    return this.db.transaction(async (trx) => {
      const { email, otp, type } = req.body;
      const commonModel = this.Model.commonModel(trx);
      const userModel = this.Model.UserModel(trx);
      const checkOtp = await commonModel.getOTP({ email, type });

      if (!checkOtp.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_FORBIDDEN,
          message: this.ResMsg.OTP_EXPIRED,
        };
      }

      const { id: email_otp_id, otp: hashed_otp, tried } = checkOtp[0];

      if (tried > 3) {
        return {
          success: false,
          code: this.StatusCode.HTTP_GONE,
          message: this.ResMsg.TOO_MUCH_ATTEMPT,
        };
      }

      const otpValidation = await Lib.compareHashValue(
        otp.toString(),
        hashed_otp
      );

      if (otpValidation) {
        await commonModel.updateOTP(
          {
            tried: tried + 1,
            matched: 1,
          },
          { id: email_otp_id }
        );

        //--change it for member
        let secret = config.JWT_SECRET_ADMIN;
        if (type === OTP_TYPE_FORGET_JOB_SEEKER) {
          secret = config.JWT_SECRET_JOB_SEEKER;
        } else if (type === OTP_TYPE_VERIFY_JOB_SEEKER) {
          secret = config.JWT_SECRET_JOB_SEEKER;
        } else if (type === OTP_TYPE_FORGET_HOTELIER) {
          secret = config.JWT_SECRET_HOTEL;
        } else if (
          type === OTP_TYPE_TWO_FA_HOTELIER ||
          OTP_TYPE_VERIFY_HOTELIER
        ) {
          secret = config.JWT_SECRET_HOTEL;
        } else if (
          type === OTP_TYPE_TWO_FA_JOB_SEEKER ||
          OTP_TYPE_VERIFY_JOB_SEEKER
        ) {
          secret = config.JWT_SECRET_JOB_SEEKER;
        } else if (type == OTP_TYPE_TWO_FA_ADMIN) {
          const checkUser = await userModel.getSingleCommonAuthUser({
            email,
            schema_name: "admin",
            table_name: USER_AUTHENTICATION_VIEW.ADMIN,
          });
          if (checkUser) {
            await this.insertAdminAudit(trx, {
              details: `Admin User ${checkUser.username}(${checkUser.email}) has logged in.`,
              endpoint: `${req.method} ${req.originalUrl}`,
              created_by: checkUser.user_id,
              type: "CREATE",
            });
          }
        }

        const token = Lib.createToken(
          {
            email: email,
            type: type,
          },
          secret,
          "15m"
        );

        return {
          success: true,
          code: this.StatusCode.HTTP_ACCEPTED,
          message: this.ResMsg.OTP_MATCHED,
          type,
          token,
        };
      } else {
        await commonModel.updateOTP(
          {
            tried: tried + 1,
          },
          { id: email_otp_id }
        );

        return {
          success: false,
          code: this.StatusCode.HTTP_UNAUTHORIZED,
          message: this.ResMsg.OTP_INVALID,
        };
      }
    });
  }

  public async getAllNotification(req: Request) {
    const model = this.Model.commonModel();
    const data = await model.getNotification(req.query as any);
    return {
      success: true,
      message: this.ResMsg.HTTP_OK,
      code: this.StatusCode.HTTP_OK,
      ...data,
    };
  }

  //get all country
  public async getAllCountry(req: Request) {
    const query = req.query;
    const model = this.Model.commonModel();
    const country_list = await model.getAllCountry({ ...query });
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: country_list,
    };
  }

  //get all city
  public async getAllCity(req: Request) {
    const { city_id, country_id, limit, skip, name, state_id } = req.query;

    const parsedParams = {
      country_id: country_id ? Number(country_id) : undefined,
      limit: limit ? Number(limit) : undefined,
      skip: skip ? Number(skip) : undefined,
      name: name as string,
      city_id: city_id ? parseInt(city_id as string) : 0,
      state_id: state_id ? parseInt(state_id as string) : 0,
    };

    const model = this.Model.commonModel();
    const city_list = await model.getAllCity(parsedParams);

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: city_list,
    };
  }
  public async getAllStates(req: Request) {
    const { state_id, country_id, limit, skip, name } = req.query;

    const parsedParams = {
      country_id: country_id ? Number(country_id) : undefined,
      limit: limit ? Number(limit) : undefined,
      skip: skip ? Number(skip) : undefined,
      name: name as string,
      state_id: state_id ? parseInt(state_id as string) : 0,
    };

    const model = this.Model.commonModel();
    const state_list = await model.getAllStates(parsedParams);

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: state_list,
    };
  }

  public async getAllNationality(req: Request) {
    const { limit, skip, name } = req.query;

    const parsedParams = {
      limit: limit ? Number(limit) : undefined,
      skip: skip ? Number(skip) : undefined,
      name: name as string,
    };

    const model = this.Model.commonModel();
    const data = await model.getAllNationality(parsedParams);

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      ...data,
    };
  }
}
export default PublicService;
