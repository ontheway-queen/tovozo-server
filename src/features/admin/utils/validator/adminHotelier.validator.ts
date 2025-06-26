import Joi from "joi";

class AdminHotelierValidator {
  public createHotelier = Joi.object({
    user: Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      username: Joi.string().required(),
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
      address_line: Joi.string().required(),
      city: Joi.string().required(),
      country: Joi.string().required(),
      zip_code: Joi.string().optional(),
    }).optional(),

    organization_amenities: Joi.array()
      .items(Joi.string().max(255).required())
      .optional(),
  });
}

export default AdminHotelierValidator;
