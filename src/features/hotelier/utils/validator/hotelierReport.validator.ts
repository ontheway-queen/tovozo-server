import Joi from "joi";
import { REPORT_TYPE_ENUM } from "../../../../utils/miscellaneous/constants";

export default class HotelierReportValidator {
	public submitReport = Joi.object({
		related_id: Joi.number().required(),
		job_post_details_id: Joi.number().required(),
		report_type: Joi.string()
			.valid(...REPORT_TYPE_ENUM)
			.required(),
		reason: Joi.string().required(),
	});
}
