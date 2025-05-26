import { TDB } from "../../features/public/utils/types/publicCommon.types";
import Schema from "../../utils/miscellaneous/schema";
import {
  ICreateJobSeekerPayload,
  IUpdateJobSeekerPayload,
  IJobPreferencePayload,
  IJobLocationPayload,
  IJobShiftPayload,
  IJobSeekerInfoPayload,
} from "../../utils/modelTypes/jobSeeker/jobSeekerModelTypes";

export default class JobSeekerModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async createJobSeeker(payload: ICreateJobSeekerPayload) {
    return await this.db("job_seeker")
      .withSchema(this.JOB_SEEKER)
      .insert(payload, "user_id");
  }

  public async updateJobSeeker(
    payload: Partial<IUpdateJobSeekerPayload>,
    where: { user_id: number }
  ) {
    return await this.db("job_seeker")
      .withSchema(this.JOB_SEEKER)
      .update(payload)
      .where((qb) => {
        if (where.user_id) {
          qb.andWhere("user_id", where.user_id);
        }
      });
  }

  public async getJobSeeker(where: { user_id: number }) {
    return await this.db("job_seeker")
      .withSchema(this.JOB_SEEKER)
      .select("*")
      .where((qb) => {
        if (where.user_id) {
          qb.andWhere("user_id", where.user_id);
        }
      })
      .first();
  }

  public async deleteJobSeeker(where: { user_id: number }) {
    return await this.db("job_seeker")
      .withSchema(this.JOB_SEEKER)
      .where((qb) => {
        if (where.user_id) {
          qb.andWhere("user_id", where.user_id);
        }
      })
      .del();
  }

  public async setJobPreferences(
    payload: IJobPreferencePayload | IJobPreferencePayload[]
  ) {
    return await this.db("job_preferences")
      .withSchema(this.JOB_SEEKER)
      .insert(payload);
  }

  public async setJobLocations(
    payload: IJobLocationPayload | IJobLocationPayload[]
  ) {
    return await this.db("job_locations")
      .withSchema(this.JOB_SEEKER)
      .insert(payload);
  }

  public async setJobShifting(payload: IJobShiftPayload | IJobShiftPayload[]) {
    return await this.db("job_shifting")
      .withSchema(this.JOB_SEEKER)
      .insert(payload);
  }

  public async getJobPreferences(job_seeker_id: number) {
    return await this.db("job_preferences AS jp")
      .withSchema(this.JOB_SEEKER)
      .select("jp.*", "j.title")
      .joinRaw("LEFT JOIN dbo.jobs j ON jp.job_id = j.id")
      .where({ job_seeker_id });
  }

  public async getJobLocations(job_seeker_id: number) {
    return await this.db("job_locations")
      .withSchema(this.JOB_SEEKER)
      .select("*")
      .where({ job_seeker_id });
  }

  public async getJobShifting(job_seeker_id: number) {
    return await this.db("job_shifting")
      .withSchema(this.JOB_SEEKER)
      .select("*")
      .where({ job_seeker_id });
  }

  public async createJobSeekerInfo(payload: IJobSeekerInfoPayload) {
    return await this.db("job_seeker_info")
      .withSchema(this.JOB_SEEKER)
      .insert(payload);
  }

  public async updateJobSeekerInfo(
    payload: Partial<IJobSeekerInfoPayload>,
    query: {
      job_seeker_id: string;
    }
  ) {
    return await this.db("job_seeker_info")
      .withSchema(this.JOB_SEEKER)
      .update(payload)
      .where((qb) => {
        if (query.job_seeker_id) {
          qb.andWhere({ job_seeker_id: query.job_seeker_id });
        }
      });
  }

  public async getJobSeekerInfo(query: { job_seeker_id: number }) {
    return await this.db("job_seeker_info")
      .withSchema(this.JOB_SEEKER)
      .select("*")
      .where((qb) => {
        if (query.job_seeker_id) {
          qb.andWhere({ job_seeker_id: query.job_seeker_id });
        }
      })
      .first();
  }
}
