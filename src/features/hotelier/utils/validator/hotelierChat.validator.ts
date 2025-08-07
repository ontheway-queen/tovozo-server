import Joi from "joi";

export default class HotelierChatValidator {
	getMessagesValidator = Joi.object({
		session_id: Joi.string().required(),
	});

	sendMessageValidator = Joi.object({
		message: Joi.string().required(),
		chat_session_id: Joi.number().positive().required(),
	});
}
