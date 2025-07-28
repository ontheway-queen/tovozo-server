import { IGetJobResponse } from "../../features/hotelier/utils/types/hotelierJobTypes";
import { TDB } from "../../features/public/utils/types/publicCommon.types";
import Schema from "../../utils/miscellaneous/schema";
import {
	ICreateJobPayload,
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
		const {
			title,
			status,
			limit,
			skip,
			orderBy = "id",
			orderTo = "desc",
		} = param;

		const buildFilter = (qb: any) => {
			qb.where("is_deleted", false);

			if (title) {
				qb.andWhere((builder: any) => {
					builder
						.where("title", "ilike", `%${title}%`)
						.orWhere("details", "ilike", `%${title}%`);
				});
			}

			if (status !== undefined) {
				qb.andWhere("status", status);
			}
		};

		const data = await this.db(this.TABLES.jobs)
			.withSchema(this.DBO_SCHEMA)
			.select(
				"id",
				"title",
				"details",
				"hourly_rate",
				"job_seeker_pay",
				"platform_fee",
				"status",
				"is_deleted"
			)
			.where(buildFilter)
			.orderBy(orderBy, orderTo)
			.limit(Number(limit || 100))
			.offset(Number(skip || 0));

		let total: number | undefined;

		if (need_total) {
			const totalQuery = await this.db(this.TABLES.jobs)
				.withSchema(this.DBO_SCHEMA)
				.count("id as total")
				.where(buildFilter)
				.first();

			total = totalQuery?.total ? Number(totalQuery.total) : undefined;
		}

		return { data, total };
	}

	public async getSingleJob(id: number): Promise<IGetJobResponse> {
		return await this.db(this.TABLES.jobs)
			.withSchema(this.DBO_SCHEMA)
			.select("*")
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
