import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import config from "../../../app/config";
import Lib from "../../../utils/lib/lib";

import CustomError from "../../../utils/lib/customError";
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
  USER_TYPE,
} from "../../../utils/miscellaneous/constants";
import {
  IGetOTPPayload,
  IMatchOTPPayload,
} from "../../../utils/modelTypes/common/commonModelTypes";
import { sendEmailOtpTemplate } from "../../../utils/templates/sendEmailOtpTemplate";
import { IAdminAuthView } from "../../auth/utils/types/adminAuth.types";

class PublicService extends AbstractServices {
  constructor() {
    super();
  }

  //send email otp service
  public async sendOtpToEmailService(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { email, type } = req.body as IGetOTPPayload;
      const userModel = this.Model.UserModel(trx);
      if (
        type === OTP_TYPE_FORGET_JOB_SEEKER ||
        type === OTP_TYPE_TWO_FA_JOB_SEEKER
      ) {
        // --check if the user exist
        const checkUser = await userModel.getSingleCommonAuthUser({
          email,
          schema_name: "jobseeker",
          table_name: USER_AUTHENTICATION_VIEW.JOB_SEEKER,
        });
        if (!checkUser) {
          throw new CustomError(
            this.ResMsg.NOT_FOUND_USER_WITH_EMAIL,
            this.StatusCode.HTTP_NOT_FOUND
          );
        }
      } else if (
        type === OTP_TYPE_FORGET_ADMIN ||
        type === OTP_TYPE_TWO_FA_ADMIN
      ) {
        const admin_details = await userModel.getSingleCommonAuthUser({
          email,
          schema_name: "admin",
          table_name: USER_AUTHENTICATION_VIEW.ADMIN,
        });
        if (!admin_details) {
          throw new CustomError(
            this.ResMsg.NOT_FOUND_USER_WITH_EMAIL,
            this.StatusCode.HTTP_NOT_FOUND
          );
        }
      } else if (type === (OTP_TYPE_VERIFY_JOB_SEEKER as typeof type)) {
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
      } else if (
        type === OTP_TYPE_FORGET_HOTELIER ||
        type === OTP_TYPE_TWO_FA_HOTELIER
      ) {
        // --check if the user exist
        const checkUser = await userModel.getSingleCommonAuthUser({
          email,
          schema_name: "hotelier",
          table_name: USER_AUTHENTICATION_VIEW.HOTELIER,
        });

        if (!checkUser) {
          throw new CustomError(
            this.ResMsg.NOT_FOUND_USER_WITH_EMAIL,
            this.StatusCode.HTTP_NOT_FOUND
          );
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
      const { email, otp, type } = req.body as IMatchOTPPayload;
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

      const { id: email_otp_id, hashed_otp, tried } = checkOtp[0];

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

      if (!otpValidation) {
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
      } else {
        await commonModel.updateOTP(
          {
            tried: tried + 1,
            matched: 1,
          },
          { id: email_otp_id }
        );
        //--change it for member
        let secret = config.JWT_SECRET_ADMIN;
        if (
          type === OTP_TYPE_FORGET_JOB_SEEKER ||
          type === OTP_TYPE_VERIFY_JOB_SEEKER ||
          type === OTP_TYPE_TWO_FA_JOB_SEEKER
        ) {
          if (type === OTP_TYPE_VERIFY_JOB_SEEKER) {
          }

          secret = config.JWT_SECRET_JOB_SEEKER;
        } else if (
          type === OTP_TYPE_FORGET_HOTELIER ||
          type === OTP_TYPE_VERIFY_HOTELIER ||
          type === OTP_TYPE_TWO_FA_HOTELIER
        ) {
          secret = config.JWT_SECRET_HOTEL;
        } else if (type == OTP_TYPE_TWO_FA_ADMIN) {
          const checkUser =
            await userModel.getSingleCommonAuthUser<IAdminAuthView>({
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

  public async deleteNotification(req: Request) {
    const { user_id, id } = req.query as unknown as {
      user_id: number;
      id?: number;
    };

    return await this.db.transaction(async (trx) => {
      const model = this.Model.commonModel(trx);

      const getMyNotification = await model.getNotification({
        id: Number(id),
        user_id,
        limit: "1",
        need_total: false,
      });

      if (!getMyNotification.data.length) {
        return {
          success: false,
          message: this.ResMsg.HTTP_NOT_FOUND,
          code: this.StatusCode.HTTP_NOT_FOUND,
        };
      }
      if (
        getMyNotification.data[0].user_type.toLowerCase() ===
        USER_TYPE.ADMIN.toLowerCase()
      ) {
        await this.insertAdminAudit(trx, {
          details: id
            ? `Notification ${id} has been deleted`
            : "All Notification has been deleted.",
          created_by: user_id,
          endpoint: req.originalUrl,
          type: "DELETE",
        });
      }
      if (id) {
        await model.deleteNotification({
          notification_id: Number(id),
          user_id,
        });
      } else {
        const getAllNotification = await model.getNotification({
          user_id,
          limit: "1000",
          need_total: false,
        });

        const payload = getAllNotification.data
          .filter((notification) => Number.isInteger(notification.id))
          .map((notification) => ({
            notification_id: notification.id,
            user_id,
          }));

        if (payload.length) {
          await model.deleteNotification(payload);
        }
      }

      return {
        success: true,
        message: this.ResMsg.HTTP_OK,
        code: this.StatusCode.HTTP_OK,
      };
    });
  }

  public async readNotification(req: Request) {
    const { user_id, id } = req.query as unknown as {
      user_id: number;
      id?: number;
    };
    return await this.db.transaction(async (trx) => {
      const model = this.Model.commonModel(trx);

      const getMyNotification = await model.getNotification({
        id: Number(id),
        user_id,
        limit: "1",
        need_total: false,
      });

      if (!getMyNotification.data.length) {
        return {
          success: false,
          message: this.ResMsg.HTTP_NOT_FOUND,
          code: this.StatusCode.HTTP_NOT_FOUND,
        };
      }
      if (
        getMyNotification.data[0].user_type.toLowerCase() ===
        USER_TYPE.ADMIN.toLowerCase()
      ) {
        await this.insertAdminAudit(trx, {
          details: id
            ? `Notification ${id} has been read`
            : "All Notification has been read.",
          created_by: user_id,
          endpoint: req.originalUrl,
          type: "UPDATE",
        });
      }

      const data = await model.readNotification({
        notification_id: Number(id),
        user_id,
      });

      return {
        success: true,
        message: this.ResMsg.HTTP_OK,
        code: this.StatusCode.HTTP_OK,
      };
    });
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

  public async getAllJob(req: Request) {
    const model = this.Model.jobModel();
    const data = await model.getAllJobs(req.query);
    return {
      success: true,
      message: this.ResMsg.HTTP_OK,
      code: this.StatusCode.HTTP_OK,
      ...data,
    };
  }
}
export default PublicService;
