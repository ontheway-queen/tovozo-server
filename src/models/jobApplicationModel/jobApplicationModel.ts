import { TDB } from "../../features/public/utils/types/publicCommon.types";
import Schema from "../../utils/miscellaneous/schema";
import { ICreateJobApplicationPayload } from "../../utils/modelTypes/jobApplication/jobApplicationModel.types";

export default class JobApplicationModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async createJobApplication(payload: ICreateJobApplicationPayload){
    return await this.db("job_applications")
      .withSchema(this.DBO_SCHEMA)
      .insert(payload, "id");   
  }

  public async markJobPostDetailAsApplied(job_post_detail_id: number) {
  return await this.db("job_post_details")
    .withSchema(this.DBO_SCHEMA)
    .update({ status: "Applied" })
    .where({ id: job_post_detail_id });
  }

}
