import { TDB } from "../../features/public/utils/types/publicCommon.types";
import { REPORT_STATUS } from "../../utils/miscellaneous/constants";
import Schema from "../../utils/miscellaneous/schema";

export default class ReportModel extends Schema {
	private db: TDB;

	constructor(db: TDB) {
		super();
		this.db = db;
	}

	public async submitReport(payload: any) {
		return await this.db("reports")
			.withSchema(this.DBO_SCHEMA)
			.insert(payload, "id");
	}

	public async getSingleReport(job_post_details_id: number) {
		return await this.db("reports")
			.withSchema(this.DBO_SCHEMA)
			.where({ job_post_details_id })
			.first();
	}

	public async getReports() {
		const data = await this.db("reports")
			.withSchema(this.DBO_SCHEMA)
			.select();
	}
}
