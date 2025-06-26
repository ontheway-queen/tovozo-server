import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import Lib from "../../../utils/lib/lib";
import { USER_TYPE } from "../../../utils/miscellaneous/constants";

class AdminAdministrationService extends AbstractServices {
  // create role
  public async createRole(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { user_id } = req.admin;

      const model = this.Model.administrationModel(trx);
      const { role_name, permissions } = req.body;
      const check_name = await model.getSingleRole({ name: role_name });
      if (check_name.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: `Role already exists with this name`,
        };
      }
      const role_res = await model.createRole({
        name: role_name,
        created_by: user_id,
      });

      const uniquePermission: any = [];

      for (let i = 0; i < permissions.length; i++) {
        let found = false;
        for (let j = 0; j < uniquePermission.length; j++) {
          if (
            permissions[i].permission_id == uniquePermission[j].permission_id
          ) {
            found = true;
            break;
          }
        }

        if (!found) {
          uniquePermission.push(permissions[i]);
        }
      }

      if (uniquePermission.length) {
        const permission_body = uniquePermission.map((element: any) => {
          return {
            role_id: role_res[0].id,
            permission_id: element.permission_id,
            read: element.read,
            write: element.write,
            update: element.update,
            delete: element.delete,
            created_by: user_id,
          };
        });

        await model.createRolePermission(permission_body);
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: this.ResMsg.HTTP_SUCCESSFUL,
      };
    });
  }

  //role list
  public async roleList(req: Request) {
    const { limit, skip } = req.query;
    const model = this.Model.administrationModel();
    const role_list = await model.roleList(Number(limit), Number(skip), true);
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total: role_list.total,
      data: role_list.data,
    };
  }

  //create permission
  public async createPermission(req: Request) {
    const { user_id } = req.admin;
    const model = this.Model.administrationModel();

    const check_name = await model.permissionsList({
      name: req.body.permission_name,
    });
    if (check_name.data.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_CONFLICT,
        message: this.ResMsg.PERMISSION_NAME_EXIST,
      };
    }

    const create_permission = await model.createPermission({
      name: req.body.permission_name,
      created_by: user_id,
    });
    if (create_permission.length) {
      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: this.ResMsg.HTTP_SUCCESSFUL,
      };
    } else {
      return {
        success: false,
        code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
        message: this.ResMsg.HTTP_INTERNAL_SERVER_ERROR,
      };
    }
  }

  //permission list
  public async permissionList(req: Request) {
    const { limit, skip } = req.query;
    const model = this.Model.administrationModel();
    const permission_list = await model.permissionsList({
      limit: Number(limit),
      skip: Number(skip),
    });
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total: permission_list.total,
      data: permission_list.data,
    };
  }

  //get single role permission
  public async getSingleRolePermission(req: Request) {
    const role_id = req.params.id;
    const model = this.Model.administrationModel();

    const role_permission = await model.getSingleRole({
      id: parseInt(role_id),
    });

    if (!role_permission.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: role_permission[0],
    };
  }

  //update role permission
  public async updateRolePermissions(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { user_id } = req.admin;
      const model = this.Model.administrationModel(trx);
      const { id: role_id } = req.params;
      const check_role = await model.getSingleRole({
        id: Number(role_id),
      });

      if (!check_role.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      if (check_role[0].is_main_role) {
        return {
          success: false,
          code: this.StatusCode.HTTP_UNPROCESSABLE_ENTITY,
          message: "You can't update main role",
        };
      }

      const { add_permissions, role_name, status } = req.body;

      if (role_name || status) {
        const check_name = await model.getSingleRole({ name: role_name });
        if (!check_name.length) {
          await model.updateRole({ name: role_name, status }, Number(role_id));
        }
      }

      if (add_permissions) {
        const { data: getAllPermission } = await model.permissionsList({});

        const add_permissionsValidation = [];

        for (let i = 0; i < add_permissions.length; i++) {
          for (let j = 0; j < getAllPermission?.length; j++) {
            if (
              add_permissions[i].permission_id ==
              getAllPermission[j].permission_id
            ) {
              add_permissionsValidation.push(add_permissions[i]);
            }
          }
        }

        // get single role permission
        const { permissions } = check_role[0];

        const insertPermissionVal: any = [];
        const haveToUpdateVal: any = [];

        for (let i = 0; i < add_permissionsValidation.length; i++) {
          let found = false;

          for (let j = 0; j < permissions.length; j++) {
            if (
              add_permissionsValidation[i].permission_id ==
              permissions[j].permission_id
            ) {
              found = true;
              haveToUpdateVal.push(add_permissionsValidation[i]);
              break;
            }
          }

          if (!found) {
            insertPermissionVal.push(add_permissions[i]);
          }
        }

        // insert permission
        const add_permission_body = insertPermissionVal.map((element: any) => {
          return {
            role_id,
            permission_id: element.permission_id,
            read: element.read,
            write: element.write,
            update: element.update,
            delete: element.delete,
            created_by: user_id,
          };
        });

        if (add_permission_body.length) {
          await model.createRolePermission(add_permission_body);
        }

        // update section
        if (haveToUpdateVal.length) {
          const update_permission_res = haveToUpdateVal.map(
            async (element: {
              read: 0 | 1;
              write: 0 | 1;
              update: 0 | 1;
              delete: 0 | 1;
              permission_id: number;
            }) => {
              await model.updateRolePermission(
                {
                  read: element.read,
                  update: element.update,
                  write: element.write,
                  delete: element.delete,
                  updated_by: user_id,
                },
                element.permission_id,
                parseInt(role_id)
              );
            }
          );
          await Promise.all(update_permission_res);
        }
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    });
  }

  public async createAdmin(req: Request) {
    const { user_id } = req.admin;
    const files = (req.files as Express.Multer.File[]) || [];
    if (files?.length) {
      req.body[files[0].fieldname] = files[0].filename;
    }
    const { password, email, phone_number, username, role_id, ...rest } =
      req.body;
    const model = this.Model.UserModel();
    const adminModel = this.Model.AdminModel();

    //check admins email and phone number
    const [check_admin] = await model.checkUser({
      email,
      type: USER_TYPE.ADMIN,
    });

    if (check_admin) {
      if (check_admin.email === email) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: this.ResMsg.EMAIL_ALREADY_EXISTS,
        };
      }
    }

    const getLastAdminID = await model.getLastUserID();
    rest.email = email;
    rest.type = USER_TYPE.ADMIN;
    rest.phone_number = phone_number;
    rest.username = username.split(" ").join("") + getLastAdminID;
    //password hashing
    const hashedPass = await Lib.hashValue(password);
    //create user
    const admin_res = await model.createUser({
      password_hash: hashedPass,
      ...rest,
    });

    await adminModel.createAdmin({
      role_id,
      user_id: admin_res[0].id,
      created_by: user_id,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_SUCCESSFUL,
      message: this.ResMsg.HTTP_SUCCESSFUL,
    };
  }

  //get all admin
  public async getAllAdmin(req: Request) {
    const model = this.Model.AdminModel();
    const data = await model.getAllAdmin(req.query, true);
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total: data.total,
      data: data.data,
    };
  }

  //get single admin
  public async getSingleAdmin(req: Request) {
    const id = Number(req.params.id);
    const model = this.Model.AdminModel();
    const [admin] = await model.getSingleAdmin({ id });

    if (!admin) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    const { password_hash, ...cleanedData } = admin;

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: cleanedData,
    };
  }

  //update admin
  public async updateAdmin(req: Request) {
    const id = Number(req.params.id);
    const { UserModel, AdminModel, administrationModel } = this.Model;
    const files = (req.files as Express.Multer.File[]) || [];

    // Attach file to request body if uploaded
    if (files.length) {
      req.body[files[0].fieldname] = files[0].filename;
    }

    const [admin] = await AdminModel().getSingleAdmin({ id });

    if (admin?.is_main) {
      return {
        success: false,
        code: this.StatusCode.HTTP_UNPROCESSABLE_ENTITY,
        message: "You can't update main admin",
      };
    }

    // Check for unique username
    if (req.body.username) {
      const [existingUser] = await AdminModel().getSingleAdmin({
        username: req.body.username,
      });
      if (existingUser && existingUser.user_id !== id) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: this.ResMsg.USERNAME_ALREADY_EXISTS,
        };
      }
    }

    // Check for unique phone number
    if (req.body.phone_number) {
      const [existingPhone] = await AdminModel().getSingleAdmin({
        phone_number: req.body.phone_number,
      });
      if (existingPhone && existingPhone.user_id !== id) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: this.ResMsg.PHONE_NUMBER_ALREADY_EXISTS,
        };
      }
    }

    const { role_id, is_2fa_on, ...rest } = req.body;

    const updatedProfile = await UserModel().updateProfile(rest, { id });

    if (role_id !== undefined || is_2fa_on !== undefined) {
      await AdminModel().updateAdmin({ role_id, is_2fa_on }, { user_id: id });
    }

    return updatedProfile
      ? {
          success: true,
          code: this.StatusCode.HTTP_OK,
          data: req.body,
        }
      : {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: this.ResMsg.HTTP_BAD_REQUEST,
        };
  }
}

export default AdminAdministrationService;
