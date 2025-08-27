import {
	TDB,
	UserStatusType,
} from "../../features/public/utils/types/publicCommon.types";
import {
	JOB_APPLICATION_STATUS,
	USER_TYPE,
} from "../../utils/miscellaneous/constants";
import Schema from "../../utils/miscellaneous/schema";
import { IJobApplicationStatus } from "../../utils/modelTypes/jobApplication/jobApplicationModel.types";
import {
	ICreateJobSeekerPayload,
	IGetJobSeeker,
	IJobSeekerProfile,
	IUpdateJobSeekerPayload,
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
			.insert(payload);
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

	public async getJobSeeker(where: {
		user_id: number;
	}): Promise<IGetJobSeeker> {
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

	public async getAllJobSeekerList(params: {
		user_id?: number;
		name?: string;
		limit?: number;
		skip?: number;
		status?: UserStatusType;
		from_date?: string;
		to_date?: string;
		sortBy: "asc" | "desc";
		application_status: IJobApplicationStatus;
	}): Promise<{ data: IJobSeekerProfile[]; total?: number | string }> {
		const {
			user_id,
			name,
			status,
			from_date,
			to_date,
			limit = 100,
			skip = 0,
			sortBy,
			application_status,
		} = params;
		const data = await this.db("vw_full_job_seeker_profile")
			.withSchema(this.JOB_SEEKER)
			.select(
				"user_id",
				"email",
				"name",
				"photo",
				"account_status",
				"user_created_at"
			)
			.distinct("user_id")
			.joinRaw(
				`LEFT JOIN ?? as ja ON ja.job_seeker_id = vw_full_job_seeker_profile.user_id`,
				[`${this.DBO_SCHEMA}.${this.TABLES.job_applications}`]
			)
			.where((qb) => {
				if (user_id) {
					qb.andWhere("user_id", user_id);
				}
				if (name) {
					qb.andWhereILike("name", `%${name}%`).orWhere(
						"email",
						name
					);
				}
				if (status) {
					qb.andWhere("account_status", status);
				}
				if (from_date && to_date) {
					qb.andWhereBetween("user_created_at", [from_date, to_date]);
				}
				if (
					application_status &&
					application_status === JOB_APPLICATION_STATUS.COMPLETED
				) {
					qb.andWhere((subQb) => {
						subQb
							.where(
								"ja.status",
								JOB_APPLICATION_STATUS.COMPLETED
							)
							.orWhereNull("ja.job_seeker_id");
					});
				}
			})
			.limit(Number(limit))
			.orderBy("user_created_at", sortBy === "asc" ? "asc" : "desc")
			.offset(Number(skip));

		const total = await this.db("vw_full_job_seeker_profile")
			.withSchema(this.JOB_SEEKER)
			.countDistinct("user_id as total")
			.joinRaw(
				`LEFT JOIN ?? as ja ON ja.job_seeker_id = vw_full_job_seeker_profile.user_id`,
				[`${this.DBO_SCHEMA}.${this.TABLES.job_applications}`]
			)
			.where((qb) => {
				if (user_id) {
					qb.andWhere("user_id", user_id);
				}
				if (name) {
					qb.andWhere((subQb) => {
						subQb
							.whereILike("name", `%${name}%`)
							.orWhere("email", name);
					});
				}
				if (status) {
					qb.andWhere("account_status", status);
				}
				if (from_date && to_date) {
					qb.andWhereBetween("user_created_at", [from_date, to_date]);
				}
				if (
					application_status &&
					application_status === JOB_APPLICATION_STATUS.COMPLETED
				) {
					qb.andWhere((subQb) => {
						subQb
							.where(
								"ja.status",
								JOB_APPLICATION_STATUS.COMPLETED
							)
							.orWhereNull("ja.job_seeker_id");
					});
				}
			})
			.first();

		return {
			data,
			total: Number(total?.total),
		};
	}

	// get single job seeker details
	public async getJobSeekerDetails(where: {
		user_id: number;
	}): Promise<IJobSeekerProfile> {
		const profile = await this.db("vw_full_job_seeker_profile")
			.withSchema(this.JOB_SEEKER)
			.select(
				"user_id",
				"email",
				"name",
				"phone_number",
				"photo",
				"user_status",
				"user_type",
				"user_created_at",
				"date_of_birth",
				"gender",
				"nationality",
				"work_permit",
				"account_status",
				"is_completed",
				"completed_at",
				"final_completed",
				"final_completed_at",
				"home_location_id",
				"home_location_name",
				"home_address",
				"home_postal_code",
				"home_status",
				"is_home_address",
				"id_copy"
			)
			.where("user_id", where.user_id)
			.first();

		const appliedJobs = await this.db("job_applications as ja")
			.withSchema(this.DBO_SCHEMA)
			.select(
				"ja.id",
				"ja.job_post_details_id",
				"ja.status as application_status",
				"j.title",
				"j.details"
			)
			.leftJoin(
				"job_post_details as jpd",
				"jpd.id",
				"ja.job_post_details_id"
			)
			.leftJoin("jobs as j", "jpd.job_id", "j.id")
			.where("ja.job_seeker_id", where.user_id);

		return {
			...profile,
			applied_jobs: appliedJobs ?? [],
		};
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

	// add bank details
	public async addBankDetails(payload: {
		job_seeker_id: number;
		account_name: string;
		account_number: string;
		bank_code: string;
	}) {
		return await this.db("job_seeker_bank_details")
			.withSchema(this.JOB_SEEKER)
			.insert(payload, "id");
	}

	// check primary account
	public async getBankAccounts(where: { id?: number; is_primary?: boolean }) {
		return await this.db("job_seeker_bank_details as jsbd")
			.withSchema(this.JOB_SEEKER)
			.select(
				"jsbd.id",
				"jsbd.job_seeker_id",
				"jsbd.account_name",
				"jsbd.account_number",
				"jsbd.bank_code",
				"jsbd.is_primary"
			)
			.where("jsbd.job_seeker_id", where.id)
			.modify((qb) => {
				if (where.is_primary) {
					qb.andWhere("jsbd.is_primary", where.is_primary);
				}
			})
			.andWhere("jsbd.is_deleted", false);
	}

	public async getJobSeekerLocation(query: { name?: string }): Promise<
		{
			user_id: number;
			type: "ADMIN" | "HOTELIER" | "JOB_SEEKER";
			name: string;
			device_id: string;
			location_id: number;
			latitude: string;
			longitude: string;
		}[]
	> {
		const { name } = query;
		return await this.db("job_seeker as js")
			.withSchema(this.JOB_SEEKER)
			.select(
				"js.user_id",
				"u.type",
				"u.name",
				"u.device_id",
				"js.location_id",
				"l.latitude",
				"l.longitude"
			)
			.joinRaw(`LEFT JOIN ?? as l ON l.id = js.location_id`, [
				`${this.DBO_SCHEMA}.${this.TABLES.location}`,
			])
			.joinRaw(`INNER JOIN ?? as u ON u.id = js.user_id`, [
				`${this.DBO_SCHEMA}.${this.TABLES.user}`,
			])
			.whereNotNull("js.location_id")
			.andWhere("u.type", USER_TYPE.JOB_SEEKER)
			.modify((qb) => {
				if (name) {
					qb.andWhereILike("u.name", `%${name}%`);
				}
			});
	}
}
