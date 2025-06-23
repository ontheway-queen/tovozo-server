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

	public async createJobPostDetails(
		payload: IJobPostDetailsPayload | IJobPostDetailsPayload[]
	) {
		return await this.db(this.TABLES.job_post_details)
			.withSchema(this.DBO_SCHEMA)
			.insert(payload, "id");
	}

	public async getJobPostList(params: any) {
		const {
			user_id,
			title,
			category_id,
			city_id,
			orderBy,
			orderTo,
			status,
			limit,
			skip,
			need_total = true,
		} = params;
		const data = await this.db("job_post as jp")
			.withSchema(this.DBO_SCHEMA)
			.select(
				"jpd.id",
				"jpd.status",
				"jpd.start_time",
				"jpd.end_time",
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
				"vwl.country_name",
				this.db.raw(`json_build_object(
                    'job_seeker_id', ja.job_seeker_id,
                    'status', ja.status,
                    'payment_status', ja.payment_status
                ) as job_post_details`)
			)
			.joinRaw(`JOIN ?? as org ON org.id = jp.organization_id`, [
				`${this.HOTELIER}.${this.TABLES.organization}`,
			])
			.join("user as u", "u.id", "org.user_id")
			.join("job_post_details as jpd", "jp.id", "jpd.job_post_id")
			.join("jobs as j", "j.id", "jpd.job_id")
			.leftJoin(
				"vw_location as vwl",
				"vwl.location_id",
				"org.location_id"
			)
			.leftJoin(
				"job_applications as ja",
				"ja.job_post_details_id",
				"jpd.id"
			)
			.where((qb) => {
				if (user_id) {
					qb.andWhere("u.id", user_id);
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
				if (status) {
					qb.andWhere("jpd.status", status);
				}
			})
			.orderBy(orderBy || "jp.id", orderTo || "desc")
			.limit(limit || 100)
			.offset(skip || 0);

		let total;
		if (need_total) {
			const totalQuery = await this.db("job_post as jp")
				.withSchema(this.DBO_SCHEMA)
				.count("jpd.id as total")
				.joinRaw(`JOIN ?? as org ON org.id = jp.organization_id`, [
					`${this.HOTELIER}.${this.TABLES.organization}`,
				])

				.join("user as u", "u.id", "org.user_id")
				.join("job_post_details as jpd", "jp.id", "jpd.job_post_id")
				.join("jobs as j", "j.id", "jpd.job_id")
				.leftJoin(
					"vw_location as vwl",
					"vwl.location_id",
					"org.location_id"
				)
				.where((qb) => {
					// qb.where("jp.status", status || "Live");
					if (user_id) {
						qb.andWhere("u.id", user_id);
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
					if (status) {
						qb.andWhere("jpd.status", status);
					}
				})
				.first();
			total = totalQuery?.total ? Number(totalQuery.total) : 0;
		}

		return {
			data,
			total,
		};
	}

	public async getSingleJobPos(id: number) {
		return await this.db("job_post as jp")
			.withSchema(this.DBO_SCHEMA)
			.select(
				"jpd.id",
				"jpd.status",
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
			.joinRaw(`JOIN ?? as org ON org.id = jp.organization_id`, [
				`${this.HOTELIER}.${this.TABLES.organization}`,
			])

			.join("user as u", "u.id", "org.user_id")
			.join("job_post_details as jpd", "jp.id", "jpd.job_post_id")
			.join("jobs as j", "j.id", "jpd.job_id")
			.leftJoin(
				"vw_location as vwl",
				"vwl.location_id",
				"org.location_id"
			)
			.where("jpd.id", id)
			.first();
	}
}

export default JobPostModel;
