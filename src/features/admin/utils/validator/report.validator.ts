import Joi from "joi";

class ReportValidator {
	public markAsAcknowledgeReportSchema = Joi.object({
		resolution: Joi.string().required(),
	});
}
export default ReportValidator;
