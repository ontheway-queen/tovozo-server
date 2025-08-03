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
	IGetJobPreference,
	IGetJobSeeker,
	IJobLocationPayload,
	IJobPreferencePayload,
	IJobSeekerInfoPayload,
	IJobSeekerProfile,
	IJobShiftPayload,
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
				"stripe_acc_id",
				"home_location_id",
				"home_location_name",
				"home_address",
				"home_postal_code",
				"home_status",
				"is_home_address",
				"languages",
				"passport_copy",
				"visa_copy",
				"id_copy",
				"job_locations"
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

	public async updateJobLocations(
		payload: Partial<IUpdateJobSeekerPayload>,
		query: {
			job_seeker_id: number;
			location_id: number;
		}
	) {
		return await this.db("job_locations")
			.withSchema(this.JOB_SEEKER)
			.update(payload)
			.where((qb) => {
				if (query.job_seeker_id) {
					qb.andWhere("job_seeker_id", query.job_seeker_id);
				}
				if (query.location_id) {
					qb.andWhere("location_id", query.location_id);
				}
			});
	}

	public async setJobShifting(
		payload: IJobShiftPayload | IJobShiftPayload[]
	) {
		return await this.db("job_shifting")
			.withSchema(this.JOB_SEEKER)
			.insert(payload);
	}

	public async getJobPreferences(
		job_seeker_id: number
	): Promise<IGetJobPreference[]> {
		return await this.db("job_preferences AS jp")
			.withSchema(this.JOB_SEEKER)
			.select("jp.*", "j.title")
			.joinRaw("LEFT JOIN dbo.jobs j ON jp.job_id = j.id")
			.where({ job_seeker_id });
	}

	public async getSingleJobPreference(query: {
		job_seeker_id: number;
		job_id: number;
	}): Promise<IGetJobPreference> {
		return await this.db("job_preferences AS jp")
			.withSchema(this.JOB_SEEKER)
			.select("jp.*", "j.title")
			.joinRaw("LEFT JOIN dbo.jobs j ON jp.job_id = j.id")
			.where((qb) => {
				if (query.job_seeker_id) {
					qb.andWhere({ job_seeker_id: query.job_seeker_id });
				}
				if (query.job_id) {
					qb.andWhere({ job_id: query.job_id });
				}
			})
			.first();
	}

	public async deleteJobPreferences(query: {
		job_seeker_id: number;
		job_ids: number[];
	}) {
		return await this.db("job_preferences AS jp")
			.withSchema(this.JOB_SEEKER)
			.del()
			.where((qb) => {
				if (query.job_seeker_id) {
					qb.andWhere({ job_seeker_id: query.job_seeker_id });
				}
				if (query.job_ids) {
					qb.whereIn("job_id", query.job_ids);
				}
			});
	}

	public async getJobLocations(job_seeker_id: number) {
		return await this.db("job_locations AS jl")
			.withSchema(this.JOB_SEEKER)
			.select(
				"jl.*",
				"l.name as location_name",
				"l.address as location_address"
			)
			.joinRaw("LEFT JOIN dbo.location l ON jl.location_id = l.id")
			.where({ job_seeker_id });
	}

	public async deleteJobLocations(query: {
		job_seeker_id: number;
		location_ids: number[];
	}) {
		return await this.db("job_locations")
			.withSchema(this.JOB_SEEKER)
			.del()
			.where((qb) => {
				qb.andWhere({ is_home_address: false });
				if (query.job_seeker_id) {
					qb.andWhere({ job_seeker_id: query.job_seeker_id });
				}
				if (query.location_ids) {
					qb.whereIn("location_id", query.location_ids);
				}
			});
	}

	public async getJobShifting(job_seeker_id: number) {
		return await this.db("job_shifting")
			.withSchema(this.JOB_SEEKER)
			.select("*")
			.where({ job_seeker_id });
	}

	public async getSingleJobShift(query: {
		job_seeker_id: number;
		shift?: string;
	}) {
		return await this.db("job_shifting")
			.withSchema(this.JOB_SEEKER)
			.select("*")
			.where((qb) => {
				if (query.job_seeker_id) {
					qb.andWhere({ job_seeker_id: query.job_seeker_id });
				}
				if (query.shift) {
					qb.andWhere({ shift: query.shift });
				}
			})
			.first();
	}

	public async deleteJobShifting(query: {
		job_seeker_id: number;
		name?: string[];
	}) {
		return await this.db("job_shifting")
			.withSchema(this.JOB_SEEKER)
			.del()
			.where((qb) => {
				if (query.job_seeker_id) {
					qb.andWhere({ job_seeker_id: query.job_seeker_id });
				}
				if (query.name) {
					qb.whereIn("shift", query.name);
				}
			});
	}

	public async createJobSeekerInfo(payload: IJobSeekerInfoPayload) {
		return await this.db("job_seeker_info")
			.withSchema(this.JOB_SEEKER)
			.insert(payload);
	}

	public async updateJobSeekerInfo(
		payload: Partial<IJobSeekerInfoPayload>,
		query: {
			job_seeker_id: number;
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
