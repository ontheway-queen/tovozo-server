import {
	TDB,
	UserStatusType,
} from "../../features/public/utils/types/publicCommon.types";
import Schema from "../../utils/miscellaneous/schema";
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
	}): Promise<{ data: IJobSeekerProfile[]; total?: number | string }> {
		const {
			user_id,
			name,
			status,
			from_date,
			to_date,
			limit = 100,
			skip = 0,
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
			})
			.limit(Number(limit))
			.offset(Number(skip));

		const total = await this.db("vw_full_job_seeker_profile")
			.withSchema(this.JOB_SEEKER)
			.count("user_id as total")
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
			})
			.first();

		return {
			data,
			total: total?.total,
		};
	}

	// get single job seeker details
	public async getJobSeekerDetails(where: {
		user_id: number;
	}): Promise<IJobSeekerProfile> {
		return await this.db("vw_full_job_seeker_profile")
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
}
