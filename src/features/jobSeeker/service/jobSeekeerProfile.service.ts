import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import { USER_AUTHENTICATION_VIEW } from "../../../utils/miscellaneous/constants";
import Lib from "../../../utils/lib/lib";
import { IChangePasswordPayload } from "../../../utils/modelTypes/common/commonModelTypes";

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
