import { TDB } from "../../features/public/utils/types/publicCommon.types";
import Schema from "../../utils/miscellaneous/schema";
import {
  IJobPostDetailsPayload,
  IJobPostPayload,
} from "../../utils/modelTypes/hotelier/jobPostModelTYpes";

class JobPostModel extends Schema {
  private db: TDB;
  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async createJobPost(payload: IJobPostPayload) {
    return await this.db(this.TABLES.job_post)
      .withSchema(this.DBO_SCHEMA)
      .insert(payload, "id");
  }

  public async createJobPostDetails(payload: IJobPostDetailsPayload) {
    return await this.db(this.TABLES.job_post_details)
      .withSchema(this.DBO_SCHEMA)
      .insert(payload, "id");
  }

  public async getJobPostList(params: any) {
    const { user_id, title, category_id, city_id, limit, skip } = params;
    const data = await this.db(this.TABLES.job_post as "jp")
      .withSchema(this.DBO_SCHEMA)
      .select(
        "jp.id",
        "jp.organization_id",
        "jp.title",
        "j.title as job_category",
        "jp.hourly_rate",
        "jp.created_time",
        "org.name as organization_name",
        "vwl.location_id",
        "vwl.location_name",
        "vwl.location_address",
        "vwl.city_name",
        "vwl.state_name",
        "vwl.country_name"
      )
      .joinRaw(`join ${this.HOTELIER}.${this.TABLES.organization} as org`)
      .join(this.TABLES.user as "u", "u.id", "org.user_id")
      .join(this.TABLES.jobs as "j", "j.id", "jp.job_id")
      .leftJoin("vw_location as vwl", "vwl.location_id", "org.location_id")
      .where((qb) => {
        if (user_id) {
          qb.andWhere("u.user_id", user_id);
        }
        if (category_id) {
          qb.andWhere("j.job_id", category_id);
        }
        if (city_id) {
          qb.andWhere("vwl.city_id", city_id);
        }
        if (title) {
          qb.andWhereILike("jp.title", `%${title}%`);
        }
      });
  }
}

export default JobPostModel;
