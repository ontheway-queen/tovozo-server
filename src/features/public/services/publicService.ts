import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import Lib from "../../../utils/lib/lib";
import config from "../../../app/config";

import { IGetOTPPayload } from "../../../utils/modelTypes/common/commonModelTypes";
import {
  OTP_EMAIL_SUBJECT,
  OTP_FOR,
  OTP_TYPE_FORGET_ADMIN,
  OTP_TYPE_FORGET_HOTELIER,
  OTP_TYPE_FORGET_JOB_SEEKER,
  OTP_TYPE_TWO_FA_HOTELIER,
  OTP_TYPE_TWO_FA_JOB_SEEKER,
  OTP_TYPE_VERIFY_JOB_SEEKER,
  USER_AUTHENTICATION_VIEW,
} from "../../../utils/miscellaneous/constants";
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
        const checkuser = await userModel.getSingleCommonAuthUser({
          email,
          schema_name: "jobseeker",
          table_name: USER_AUTHENTICATION_VIEW.JOB_SEEKER,
        });
        if (!checkuser) {
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

        if (!checkUser.length || checkUser[0].is_verified) {
          return {
            success: false,
            code: this.StatusCode.HTTP_NOT_FOUND,
            message: "No unverified user found.",
          };
        }
      } else if (type === OTP_TYPE_FORGET_HOTELIER) {
        // --check if the user exist
        const userModel = this.Model.UserModel();
        const checkuser = await userModel.getSingleCommonAuthUser({
          email,
          schema_name: "hotelier",
          table_name: USER_AUTHENTICATION_VIEW.HOTELIER,
        });

        if (!checkuser) {
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
          const checkUser = await userModel.getSingleCommonAuthUser({
            email,
            schema_name: "jobseeker",
            table_name: USER_AUTHENTICATION_VIEW.JOB_SEEKER,
          });

          if (!checkUser || checkUser[0]?.is_verified) {
            return {
              success: false,
              code: this.StatusCode.HTTP_NOT_FOUND,
              message: "No unverified user found.",
            };
          }

          await userModel.updateProfile(
            { is_verified: true },
            { id: checkUser[0].id }
          );

          return {
            success: true,
            code: this.StatusCode.HTTP_ACCEPTED,
            message: "User successfully verified.",
          };
        } else if (type === OTP_TYPE_FORGET_HOTELIER) {
          secret = config.JWT_SECRET_HOTEL;
        } else if (type === OTP_TYPE_TWO_FA_HOTELIER) {
          secret = config.JWT_SECRET_HOTEL;
        } else if (type === OTP_TYPE_TWO_FA_JOB_SEEKER) {
          secret = config.JWT_SECRET_JOB_SEEKER;
        }

        const token = Lib.createToken(
          {
            email: email,
            type: type,
          },
          secret,
          "5m"
        );

        return {
          success: true,
          code: this.StatusCode.HTTP_ACCEPTED,
          message: this.ResMsg.OTP_MATCHED,
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
}
export default PublicService;
