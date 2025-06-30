import Joi from "joi";
import { USER_STATUS_ENUM } from "../../../../utils/miscellaneous/constants";

class AdminHotelierValidator {
	public createHotelier = Joi.object({
		user: Joi.object({
			name: Joi.string().required(),
			email: Joi.string().email().required(),
			password: Joi.string().min(6).required(),
			phone_number: Joi.string().required(),
			photo: Joi.string().optional(),
			designation: Joi.string().required(),
		}).required(),
		organization: Joi.object({
			name: Joi.string().required(),
			description: Joi.string().optional(),
		}).optional(),

		organization_address: Joi.object({
			name: Joi.string().required(),
			address: Joi.string().required(),
			city_id: Joi.string().required(),
			postal_code: Joi.string().required(),
			longitude: Joi.string().required(),
			latitude: Joi.string().required(),
		}).optional(),

		organization_amenities: Joi.array()
			.items(Joi.string().max(255).required())
			.optional(),
	});

	public getHoteliersQuery = Joi.object({
		id: Joi.number().optional(),
		user_id: Joi.number().optional(),
		name: Joi.string().trim().min(1).max(255),
		status: Joi.string()
			.valid(...USER_STATUS_ENUM)
			.optional(),
		from_date: Joi.date().optional(),
		to_date: Joi.date().optional(),
		limit: Joi.number().integer().default(100).optional(),
		skip: Joi.number().integer().default(0).optional(),
	});

	public updateHotelier = Joi.object({
		user: Joi.object({
			name: Joi.string().optional(),
			email: Joi.string().email().optional(),
			password: Joi.string().min(6).optional(),
			phone_number: Joi.string().optional(),
			photo: Joi.string().optional(),
			designation: Joi.string().optional(),
		}).optional(),
		organization: Joi.object({
			name: Joi.string().optional(),
			description: Joi.string().optional(),
		}).optional(),

		organization_address: Joi.object({
			name: Joi.string().optional(),
			address: Joi.string().optional(),
			city_id: Joi.string().optional(),
			postal_code: Joi.string().optional(),
			longitude: Joi.string().optional(),
			latitude: Joi.string().optional(),
		}).optional(),

		organization_amenities: Joi.array()
			.items(Joi.string().max(255).optional())
			.optional(),
	});
}

export default AdminHotelierValidator;
