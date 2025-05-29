import Joi from "joi";

class AdminAdministrationValidator {
  //Role validation
  public createRole = Joi.object({
    role_name: Joi.string().required(),
    permissions: Joi.array()
      .items({
        permission_id: Joi.number().required(),
        read: Joi.number().valid(0, 1).required(),
        update: Joi.number().valid(0, 1).required(),
        write: Joi.number().valid(0, 1).required(),
        delete: Joi.number().valid(0, 1).required(),
      })
      .required(),
  });

  //Permission validation
  public createPermission = Joi.object({
    permission_name: Joi.string().min(1).max(255).required(),
  });

  //Update role permissions validator
  public updateRolePermissions = Joi.object({
    role_name: Joi.string().optional(),
    status: Joi.number().valid(0, 1).optional(),
    add_permissions: Joi.array()
      .items({
        permission_id: Joi.number().required(),
        read: Joi.number().valid(0, 1).required(),
        update: Joi.number().valid(0, 1).required(),
        write: Joi.number().valid(0, 1).required(),
        delete: Joi.number().valid(0, 1).required(),
      })
      .optional(),
  });

  //create admin
  public createAdmin = Joi.object({
    username: Joi.string().required().lowercase().trim(),
    name: Joi.string().required(),
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(8).required(),
    phone_number: Joi.string().required(),
    role_id: Joi.number().required(),
  });

  // Create B2B Admin validator
  public createB2bAdmin = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(8).required(),
    mobile_number: Joi.string().required(),
    role_id: Joi.number().required(),
  });

  // Update B2B Admin
  public updateB2bAdmin = Joi.object({
    name: Joi.string(),
    email: Joi.string().email().lowercase(),
    password: Joi.string().min(8),
    mobile_number: Joi.string(),
    role_id: Joi.number(),
  });

  //get all admin query validator
  public getAllAdminQueryValidator = Joi.object({
    filter: Joi.string(),
    role: Joi.number(),
    limit: Joi.number(),
    skip: Joi.number(),
    status: Joi.string(),
  });

  //update admin
  public updateAdmin = Joi.object({
    username: Joi.string(),
    name: Joi.string(),
    phone_number: Joi.string(),
    role_id: Joi.number(),
    status: Joi.boolean(),
    is_2fa_on: Joi.boolean().optional(),
  });

  //get users filter validator
  public getUsersFilterValidator = Joi.object({
    filter: Joi.string(),
    status: Joi.boolean(),
    limit: Joi.number(),
    skip: Joi.number(),
  });

  //update user profile
  public editUserProfileValidator = Joi.object({
    username: Joi.string().min(1).max(255).optional(),
    is_2fa_on: Joi.boolean().optional(),
    name: Joi.string().optional(),
  });

  //create city
  public createCityValidator = Joi.object({
    country_id: Joi.number().required(),
    name: Joi.string().required(),
  });
}

export default AdminAdministrationValidator;
