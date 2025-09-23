import { TDB } from "../../features/public/utils/types/publicCommon.types";
import Schema from "../../utils/miscellaneous/schema";

class JobCancellationPaymentModel extends Schema {
	private db: TDB;

	constructor(db: TDB) {
		super();
		this.db = db;
	}

	public async createJobCancellationPayment(payload: any) {
		return await this.db("job_cancellation_payments")
			.withSchema(this.DBO_SCHEMA)
			.insert(payload);
	}
}
export default JobCancellationPaymentModel;
