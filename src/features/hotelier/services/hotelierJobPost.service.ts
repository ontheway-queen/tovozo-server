import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import CustomError from "../../../utils/lib/customError";
import {
  IJobPostDetailsPayload,
  IJobPostPayload,
} from "../../../utils/modelTypes/hotelier/jobPostModelTYpes";

class HotelierJobPostService extends AbstractServices {
  public async createJobPost(req: Request) {
    const { user_id } = req.hotelier;
    const body = req.body as {
      job_post: IJobPostPayload;
      job_post_details: IJobPostDetailsPayload;
    };
    return await this.db.transaction(async (trx) => {
      const model = this.Model.jobPostModel(trx);
      const organizationModel = this.Model.organizationModel(trx);
      const jobModel = this.Model.jobModel(trx);
      const checkOrganization = await organizationModel.getOrganization({
        user_id,
      });
      if (!checkOrganization) {
        throw new CustomError(
          "Organization not found!",
          this.StatusCode.HTTP_NOT_FOUND
        );
      }
      body.job_post.organization_id = checkOrganization.id;
      const checkJob = await jobModel.getSingleJob(
        body.job_post_details.job_id
      );
      if (!checkJob) {
        throw new CustomError(
          "Invalid Job Category!",
          this.StatusCode.HTTP_BAD_REQUEST
        );
      }
      const res = await model.createJobPost(body.job_post);
      if (!res.length) {
        throw new CustomError(
          this.ResMsg.HTTP_BAD_REQUEST,
          this.StatusCode.HTTP_BAD_REQUEST
        );
      }
      body.job_post_details.job_post_id = res[0].id;
      await model.createJobPostDetails(body.job_post_details);
      return {
        success: true,
        message: this.ResMsg.HTTP_SUCCESSFUL,
        code: this.StatusCode.HTTP_SUCCESSFUL,
      };
    });
  }
}
export default HotelierJobPostService;
