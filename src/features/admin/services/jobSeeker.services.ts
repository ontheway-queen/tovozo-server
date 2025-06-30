import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import CustomError from "../../../utils/lib/customError";
import Lib from "../../../utils/lib/lib";
import {
  BRITISH_ID,
  USER_STATUS,
  USER_TYPE,
} from "../../../utils/miscellaneous/constants";
import { NotificationTypeEnum } from "../../../utils/modelTypes/common/commonModelTypes";
import { TypeUser } from "../../../utils/modelTypes/user/userModelTypes";
import {
  registrationFromAdminTemplate,
  registrationVerificationCompletedTemplate,
} from "../../../utils/templates/registrationVerificationCompletedTemplate";
import {
  IJobSeekerInfoBody,
  IJobSeekerNationalityBody,
  IJobSeekerUserBody,
} from "../../auth/utils/types/jobSeekerAuth.types";
import { UserStatusType } from "../../public/utils/types/publicCommon.types";
import { IAdminJobSeekerUpdateParsedBody } from "../utils/types/adminJobSeeker.types";
class AdminJobSeekerService extends AbstractServices {
  public async createJobSeeker(req: Request) {
    return this.db.transaction(async (trx) => {
      const { user_id } = req.admin;
      const files = (req.files as Express.Multer.File[]) || [];

      const parseInput = (key: string) =>
        Lib.safeParseJSON(req.body[key]) || {};

      const userInput = parseInput("user") as IJobSeekerUserBody;
      const jobSeekerInput = parseInput(
        "job_seeker"
      ) as IJobSeekerNationalityBody;
      const jobSeekerInfoInput = parseInput(
        "job_seeker_info"
      ) as IJobSeekerInfoBody;

      // Attach file references
      files.forEach(({ fieldname, filename }) => {
        if (fieldname === "photo") {
          userInput.photo = filename;
        } else {
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

      const { email, phone_number, password, ...restUserData } = userInput;

      const userModel = this.Model.UserModel(trx);
      const jobSeekerModel = this.Model.jobSeekerModel(trx);

      const existingUser = await userModel.checkUser({
        email,
        phone_number,
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

      const jobSeekerId = registration[0].id;

      await jobSeekerModel.createJobSeeker({
        ...jobSeekerInput,
        user_id: jobSeekerId,
      });

      await jobSeekerModel.createJobSeekerInfo({
        ...jobSeekerInfoInput,
        job_seeker_id: jobSeekerId,
      });

      const tokenPayload = {
        user_id: jobSeekerId,
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
        content: `Hi ${userInput.name}, your account has been created successfully`,
        related_id: jobSeekerId,
        type: NotificationTypeEnum.JOB_SEEKER_VERIFICATION,
      });

      await this.insertAdminAudit(trx, {
        created_by: user_id,
        details: `A job seeker account (${userInput.name}) has been created.`,
        endpoint: req.originalUrl,
        type: "CREATE",
        payload: JSON.stringify(parseInput),
      });

      await Lib.sendEmailDefault({
        email,
        emailSub: `Hi ${userInput.name}, your account has been created successfully`,
        emailBody: registrationFromAdminTemplate(userInput.name, {
          email: userInput.email,
          password: userInput.password,
        }),
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: this.ResMsg.HTTP_SUCCESSFUL,
        data: tokenPayload,
      };
    });
  }

  public async getJobSeekers(req: Request) {
    const {
      name,
      status,
      limit = 100,
      skip = 0,
      from_date,
      to_date,
    } = req.query as unknown as {
      name?: string;
      status?: UserStatusType;
      limit?: number;
      skip?: number;
      from_date?: string;
      to_date?: string;
    };
    const model = this.Model.jobSeekerModel();
    const data = await model.getAllJobSeekerList({
      name,
      limit,
      skip,
      status,
      from_date,
      to_date,
    });

    return {
      success: true,
      message: this.ResMsg.HTTP_OK,
      code: this.StatusCode.HTTP_OK,
      ...data,
    };
  }

  public async getSingleJobSeeker(req: Request) {
    const { id } = req.params as unknown as { id: number };
    const model = this.Model.jobSeekerModel();
    const data = await model.getJobSeekerDetails({ user_id: id });
    if (!data) {
      return {
        success: false,
        message: this.ResMsg.HTTP_NOT_FOUND,
        code: this.StatusCode.HTTP_NOT_FOUND,
      };
    }
    return {
      success: true,
      message: this.ResMsg.HTTP_OK,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }

  public async updateJobSeeker(req: Request) {
    const id = req.params.id as unknown as number;
    return await this.db.transaction(async (trx) => {
      const model = this.Model.jobSeekerModel(trx);
      const data = await model.getJobSeekerDetails({ user_id: id });
      if (!data) {
        return {
          success: false,
          message: this.ResMsg.HTTP_NOT_FOUND,
          code: this.StatusCode.HTTP_NOT_FOUND,
        };
      }
      const files = req.files as Express.MulterS3.File[];
      const parsed = {
        user: Lib.safeParseJSON(req.body.user) || {},
        jobSeeker: Lib.safeParseJSON(req.body.job_seeker) || {},
        jobSeekerInfo: Lib.safeParseJSON(req.body.job_seeker_info) || {},
        ownAddress: Lib.safeParseJSON(req.body.own_address) || {},
        addJobPreferences:
          Lib.safeParseJSON(req.body.add_job_preferences) || [],
        delJobPreferences:
          Lib.safeParseJSON(req.body.del_job_preferences) || [],
        addJobLocations: Lib.safeParseJSON(req.body.add_job_locations) || [],
        delJobLocations: Lib.safeParseJSON(req.body.del_job_locations) || [],
        updateJobLocations:
          Lib.safeParseJSON(req.body.update_job_locations) || [],
        addJobShifting: Lib.safeParseJSON(req.body.add_job_shifting) || [],
        delJobShifting: Lib.safeParseJSON(req.body.del_job_shifting) || [],
      } as IAdminJobSeekerUpdateParsedBody;

      for (const { fieldname, filename } of files) {
        switch (fieldname) {
          case "resume":
            parsed.jobSeekerInfo.resume = filename;
            break;
          case "photo":
            parsed.user.photo = filename;
            break;
          default:
            throw new CustomError(
              this.ResMsg.UNKNOWN_FILE_FIELD,
              this.StatusCode.HTTP_BAD_REQUEST,
              "ERROR"
            );
        }
      }

      const userModel = this.Model.UserModel(trx);
      const jobSeekerModel = this.Model.jobSeekerModel(trx);
      const commonModel = this.Model.commonModel(trx);

      const [existingUser] = await userModel.checkUser({
        id: id,
        type: USER_TYPE.JOB_SEEKER,
      });

      if (!existingUser) {
        throw new CustomError(
          this.ResMsg.HTTP_NOT_FOUND,
          this.StatusCode.HTTP_NOT_FOUND,
          "ERROR"
        );
      }

      if (
        parsed?.user?.phone_number &&
        parsed.user.phone_number !== existingUser.phone_number
      ) {
        const phoneExists = await userModel.checkUser({
          phone_number: parsed.user.phone_number,
          type: USER_TYPE.JOB_SEEKER,
        });

        if (phoneExists) {
          throw new CustomError(
            this.ResMsg.PHONE_NUMBER_ALREADY_EXISTS,
            this.StatusCode.HTTP_BAD_REQUEST,
            "ERROR"
          );
        }
      }

      const updateTasks: Promise<any>[] = [];

      if (Object.keys(parsed.user).length > 0) {
        updateTasks.push(userModel.updateProfile(parsed.user, { id }));
      }

      if (Object.keys(parsed.ownAddress).length > 0) {
        updateTasks.push(
          commonModel.updateLocation(parsed.ownAddress, {
            location_id: parsed.ownAddress.id!,
          })
        );
      }

      if (Object.keys(parsed.jobSeeker).length > 0) {
        if (parsed.jobSeeker.account_status) {
          const checkJobSeeker = await jobSeekerModel.getJobSeeker({
            user_id: id,
          });
          if (!checkJobSeeker) {
            throw new CustomError(
              "Job Seeker account not found!",
              this.StatusCode.HTTP_NOT_FOUND
            );
          }

          if (
            parsed.jobSeeker.account_status === checkJobSeeker.account_status
          ) {
            throw new CustomError(
              `Already updated status to ${parsed.jobSeeker.account_status}`,
              this.StatusCode.HTTP_CONFLICT
            );
          }
        }
        updateTasks.push(
          jobSeekerModel.updateJobSeeker(parsed.jobSeeker, { user_id: id })
        );
      }

      if (Object.keys(parsed.jobSeekerInfo).length > 0) {
        updateTasks.push(
          jobSeekerModel.updateJobSeekerInfo(parsed.jobSeekerInfo, {
            job_seeker_id: id,
          })
        );
      }

      if (parsed.delJobPreferences.length > 0) {
        updateTasks.push(
          jobSeekerModel.deleteJobPreferences({
            job_seeker_id: id,
            job_ids: parsed.delJobPreferences,
          })
        );
      }

      if (parsed.delJobLocations.length > 0) {
        updateTasks.push(
          jobSeekerModel.deleteJobLocations({
            job_seeker_id: id,
            location_ids: parsed.delJobLocations,
          })
        );
      }

      if (parsed.delJobShifting.length > 0) {
        updateTasks.push(
          jobSeekerModel.deleteJobShifting({
            job_seeker_id: id,
            name: parsed.delJobShifting,
          })
        );
      }

      if (parsed.updateJobLocations.length > 0) {
        for (const loc of parsed.updateJobLocations) {
          updateTasks.push(
            commonModel.updateLocation(loc, { location_id: loc.id })
          );
        }
      }

      if (parsed.addJobLocations.length > 0) {
        const locationIds = await commonModel.createLocation(
          parsed.addJobLocations
        );

        const jobLocations = locationIds.map((loc: { id: number }) => ({
          job_seeker_id: id,
          location_id: loc.id,
        }));

        updateTasks.push(jobSeekerModel.setJobLocations(jobLocations));
      }

      if (parsed.addJobPreferences.length > 0) {
        const existingPrefer = await jobSeekerModel.getJobPreferences(id);

        const existingJobIds = new Set(existingPrefer.map((p) => p.job_id));

        const newPrefer = parsed.addJobPreferences.filter(
          (id: number) => !existingJobIds.has(id)
        );

        if (newPrefer.length !== parsed.addJobPreferences.length) {
          throw new CustomError(
            "Some job preferences already exist",
            this.StatusCode.HTTP_BAD_REQUEST,
            "ERROR"
          );
        }

        const preferences = newPrefer.map((job_id: number) => ({
          job_seeker_id: id,
          job_id,
        }));

        updateTasks.push(jobSeekerModel.setJobPreferences(preferences));
      }

      if (parsed.addJobShifting.length > 0) {
        const existingShifts = await jobSeekerModel.getJobShifting(id);

        const existingShiftNames = new Set(existingShifts.map((s) => s.shift));

        const newShifts = parsed.addJobShifting.filter(
          (shift: string) => !existingShiftNames.has(shift)
        );

        if (newShifts.length !== parsed.addJobShifting.length) {
          throw new CustomError(
            "Some job shifts already exist",
            this.StatusCode.HTTP_BAD_REQUEST,
            "ERROR"
          );
        }

        const shifts = newShifts.map((shift: string) => ({
          job_seeker_id: id,
          shift,
        }));

        updateTasks.push(jobSeekerModel.setJobShifting(shifts));
      }

      await Promise.all(updateTasks);

      if (parsed.jobSeeker.account_status === USER_STATUS.ACTIVE) {
        await Lib.sendEmailDefault({
          email: existingUser.email,
          emailSub:
            "Job Seeker Account Activation Successful – You Can Now Log In",
          emailBody: registrationVerificationCompletedTemplate(
            existingUser.name,
            "Trabill OTA B2B://login"
          ),
        });

        // await this.insertNotification(trx, TypeUser.JOB_SEEKER, {
        //   user_id: id,
        //   content: `Your account has been updated to ${parsed.jobSeeker.account_status}`,
        //   related_id: id,
        //   type: "JOB_SEEKER_VERIFICATION",
        // });
      }

      await this.insertAdminAudit(trx, {
        details: `Job seeker (${existingUser.name} - ${id}) profile has been updated.`,
        created_by: req.admin.user_id,
        endpoint: req.originalUrl,
        type: "UPDATE",
        payload: JSON.stringify(parsed),
      });
      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    });
  }

  public async deleteJobSeeker(req: Request) {
    const id = req.params.id as unknown as number;
    return await this.db.transaction(async (trx) => {
      const model = this.Model.jobSeekerModel();
      const data = await model.getJobSeekerDetails({ user_id: id });
      if (!data) {
        return {
          success: false,
          message: this.ResMsg.HTTP_NOT_FOUND,
          code: this.StatusCode.HTTP_NOT_FOUND,
        };
      }
      const userModel = this.Model.UserModel(trx);
      await userModel.deleteUser(id);
      await this.insertAdminAudit(trx, {
        details: `Job seeker (${data.name} - ${id}) has been deleted.`,
        created_by: req.admin.user_id,
        endpoint: req.originalUrl,
        type: "DELETE",
      });
      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: `Job seeker (${data.name} - ${id}) has been deleted successfully.`,
      };
    });
  }
}

export default AdminJobSeekerService;
