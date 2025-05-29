import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import {
  USER_AUTHENTICATION_VIEW,
  USER_TYPE,
} from "../../../utils/miscellaneous/constants";
import Lib from "../../../utils/lib/lib";
import { IChangePasswordPayload } from "../../../utils/modelTypes/common/commonModelTypes";
import CustomError from "../../../utils/lib/customError";
import { object } from "joi";

export default class JobSeekerProfileService extends AbstractServices {
  constructor() {
    super();
  }

  // get profile
  public getProfile = async (req: Request) => {
    const { user_id } = req.jobSeeker;
    const userModel = this.Model.UserModel();
    const jobSeekerModel = this.Model.jobSeekerModel();

    const { password_hash, ...rest } = await userModel.getSingleCommonAuthUser({
      table_name: USER_AUTHENTICATION_VIEW.JOB_SEEKER,
      schema_name: "jobseeker",
      user_id,
    });

    const jobPreferences = await jobSeekerModel.getJobPreferences(user_id);
    const jobLocations = await jobSeekerModel.getJobLocations(user_id);
    const jobShifts = await jobSeekerModel.getJobShifting(user_id);
    const jobSeekerInfo = await jobSeekerModel.getJobSeekerInfo({
      job_seeker_id: user_id,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: {
        ...rest,
        jobSeekerInfo,
        jobPreferences,
        jobLocations,
        jobShifts,
      },
    };
  };

  public async updateProfile(req: Request) {
    return this.db.transaction(async (trx) => {
      const files = (req.files as Express.Multer.File[]) || [];

      const user = Lib.safeParseJSON(req.body.user);
      const jobSeeker = Lib.safeParseJSON(req.body.job_seeker);
      const jobPreferencesInput = Lib.safeParseJSON(req.body.job_preferences);
      const jobLocationsInput = Lib.safeParseJSON(req.body.job_locations);
      const jobShiftingInput = Lib.safeParseJSON(req.body.job_shifting);
      const jobSeekerInfo = Lib.safeParseJSON(req.body.job_seeker_info) || {};

      const { user_id } = req.jobSeeker;

      for (const { fieldname, filename } of files) {
        if (fieldname === "resume") {
          jobSeekerInfo.resume = filename;
        } else if (fieldname === "photo") {
          user.photo = filename;
        } else {
          throw new CustomError(
            this.ResMsg.UNKNOWN_FILE_FIELD,
            this.StatusCode.HTTP_BAD_REQUEST,
            "ERROR"
          );
        }
      }

      const userModel = this.Model.UserModel(trx);
      const jobSeekerModel = this.Model.jobSeekerModel(trx);

      const existingUser = await userModel.checkUser({
        id: user_id,
        type: USER_TYPE.JOB_SEEKER,
      });

      if (!existingUser) {
        throw new CustomError(
          this.ResMsg.HTTP_NOT_FOUND,
          this.StatusCode.HTTP_NOT_FOUND,
          "ERROR"
        );
      }

      if (Object.keys(user).length) {
        await userModel.updateProfile(user, { id: user_id });
      }

      await jobSeekerModel.updateJobSeeker(jobSeeker, { user_id });

      const hasPreferences = Array.isArray(jobPreferencesInput);
      if (hasPreferences) {
        await jobSeekerModel.deleteJobPreferences(user_id);
        const jobPreferences = jobPreferencesInput.map((job_id: number) => ({
          job_seeker_id: user_id,
          job_id,
        }));
        await jobSeekerModel.setJobPreferences(jobPreferences);
      }

      const hasLocations = Array.isArray(jobLocationsInput);
      if (hasLocations) {
        await jobSeekerModel.deleteJobLocations(user_id);
        const jobLocations = jobLocationsInput.map((location_id: number) => ({
          job_seeker_id: user_id,
          location_id,
        }));
        await jobSeekerModel.setJobLocations(jobLocations);
      }

      const hasShifting = Array.isArray(jobShiftingInput);
      if (hasShifting) {
        await jobSeekerModel.deleteJobShifting(user_id);
        const jobShifting = jobShiftingInput.map((shift: string) => ({
          job_seeker_id: user_id,
          shift,
        }));
        await jobSeekerModel.setJobShifting(jobShifting);
      }

      await jobSeekerModel.updateJobSeekerInfo(jobSeekerInfo, {
        job_seeker_id: user_id,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    });
  }

  //change password
  public async changePassword(req: Request) {
    const { user_id } = req.jobSeeker;
    const { old_password, new_password } = req.body as IChangePasswordPayload;

    const model = this.Model.UserModel();
    const user_details = await model.getSingleCommonAuthUser({
      schema_name: "jobseeker",
      table_name: USER_AUTHENTICATION_VIEW.JOB_SEEKER,
      user_id,
    });
    if (!user_details) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    const verify_password = await Lib.compareHashValue(
      old_password,
      user_details.password_hash
    );
    if (!verify_password) {
      return {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: this.ResMsg.PASSWORDS_DO_NOT_MATCH,
      };
    }

    const hashed_password = await Lib.hashValue(new_password);
    const password_changed = await model.updateProfile(
      { password_hash: hashed_password },
      { id: user_id }
    );
    if (password_changed) {
      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.PASSWORD_CHANGED,
      };
    } else {
      return {
        success: false,
        code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
        message: this.ResMsg.HTTP_INTERNAL_SERVER_ERROR,
      };
    }
  }
}
