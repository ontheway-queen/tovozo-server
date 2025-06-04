import { TDB } from "../../features/public/utils/types/publicCommon.types";
import Schema from "../../utils/miscellaneous/schema";
import {
  ICreateJobPayload,
  IGetJobResponse,
  IJobGetParam,
  IJobUpdatePayload,
} from "../../utils/modelTypes/jobs/jobsModelTypes";

class JobModel extends Schema {
  private db: TDB;
  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async createJob(payload: ICreateJobPayload) {
    return await this.db(this.TABLES.jobs)
      .withSchema(this.DBO_SCHEMA)
      .insert(payload);
  }

  public async getAllJobs(
    param: IJobGetParam,
    need_total = true
  ): Promise<{
    data: IGetJobResponse[];
    total?: number;
  }> {
    const data = await this.db(this.TABLES.jobs)
      .withSchema(this.DBO_SCHEMA)
      .select("id", "title", "details", "status")
      .where((qb) => {
        qb.where("is_deleted", 0);
        if (param.title) {
          qb.andWhere("title", param.title);
        }
        if (param.status) {
          qb.andWhere("status", param.status);
        }
      })
      .orderBy(param.orderBy || "id", param.orderTo || "desc")
      .limit(Number(param.limit || "100"))
      .offset(Number(param.skip || "0"));
    let total;
    if (need_total) {
      const totalQuery = await this.db(this.TABLES.jobs)
        .withSchema(this.DBO_SCHEMA)
        .count("id as total")
        .where((qb) => {
          qb.where("is_deleted", false);
          if (param.title) {
            qb.andWhere("title", param.title);
          }
          if (param.status) {
            qb.andWhere("status", param.status);
          }
        })
        .first();
      total = totalQuery?.total ? Number(totalQuery.total) : undefined;
    }
    return {
      data,
      total,
    };
  }
  public async getSingleJob(id: number): Promise<IGetJobResponse> {
    return await this.db(this.TABLES.jobs)
      .withSchema(this.DBO_SCHEMA)
      .select("id", "title", "details", "status")
      .where((qb) => {
        qb.where("is_deleted", false);

        qb.andWhere({ id });
      })
      .first();
  }

  public async updateJob(payload: IJobUpdatePayload, id: number) {
    return await this.db(this.TABLES.jobs)
      .withSchema(this.DBO_SCHEMA)
      .update(payload)
      .where({ id });
  }

  public async deleteJob(id: number) {
    return await this.db(this.TABLES.jobs)
      .withSchema(this.DBO_SCHEMA)
      .update("is_deleted", true)
      .where({ id });
  }
}
export default JobModel;
