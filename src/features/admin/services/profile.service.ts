import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import Lib from "../../../utils/lib/lib";
import { IChangePasswordPayload } from "../../../utils/modelTypes/common/commonModelTypes";

class AdminProfileService extends AbstractServices {
  // Get profile
  public async getProfile(req: Request) {
    const { user_id } = req.admin;
    const administrationModel = this.Model.administrationModel();
    const adminModel = this.Model.AdminModel();

    const [profile] = await adminModel.getSingleAdmin({
      id: user_id,
    });
    console.log("Profile data:", profile);
    if (!profile) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    const { password_hash, created_by, role_id, ...userData } = profile;
    const [rolePermission = {}] = await administrationModel.getSingleRole({
      id: role_id,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: {
        ...userData,
        role_id,
        permissions: rolePermission,
      },
    };
  }

  // Edit profile
  public async editProfile(req: Request) {
    const { user_id } = req.admin;
    const files = req.files as Express.Multer.File[];
    return await this.db.transaction(async (trx) => {
      const userModel = this.Model.UserModel(trx);
      const adminModel = this.Model.AdminModel(trx);

      if (files?.length) {
        req.body[files[0].fieldname] = files[0].filename;
      }

      const { username, name, photo, is_2fa_on } = req.body as {
        username?: string;
        name?: string;
        photo?: string;
        is_2fa_on?: boolean;
      };

      if (username) {
        const existingAdmins = await adminModel.getSingleAdmin({
          username,
        });
        if (existingAdmins.length) {
          return {
            success: false,
            code: this.StatusCode.HTTP_CONFLICT,
            message: this.ResMsg.USERNAME_ALREADY_EXISTS,
          };
        }
      }
      const updateResult = await userModel.updateProfile(
        { username, name, photo },
        { id: user_id }
      );

      if (is_2fa_on !== undefined) {
        await adminModel.updateAdmin({ is_2fa_on }, { user_id });
        await this.insertAdminAudit(trx, {
          details: `Admin User ${username}(${user_id}) has updated 2FA settings to ${is_2fa_on}.`,
          endpoint: `${req.method} ${req.originalUrl}`,
          created_by: user_id,
          type: "UPDATE",
        });
      }

      return {
        success: !!updateResult,
        code: updateResult
          ? this.StatusCode.HTTP_OK
          : this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
        message: updateResult
          ? this.ResMsg.HTTP_OK
          : this.ResMsg.HTTP_INTERNAL_SERVER_ERROR,
      };
    });
  }

  // Change password
  public async changePassword(req: Request) {
    const { user_id } = req.admin;
    const { old_password, new_password } = req.body as IChangePasswordPayload;
    return await this.db.transaction(async (trx) => {
      const adminModel = this.Model.AdminModel(trx);
      const userModel = this.Model.UserModel(trx);
      const [admin] = await adminModel.getSingleAdmin({
        id: user_id,
      });
      if (!admin) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      const isOldPasswordValid = await Lib.compareHashValue(
        old_password,
        admin.password_hash
      );

      if (!isOldPasswordValid) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: this.ResMsg.PASSWORDS_DO_NOT_MATCH,
        };
      }

      const password_hash = await Lib.hashValue(new_password);
      const result = await userModel.updateProfile(
        { password_hash },
        { id: user_id }
      );

      await this.insertAdminAudit(trx, {
        details: `Admin User ${admin.username}(${user_id}) has changed their own password.`,
        endpoint: `${req.method} ${req.originalUrl}`,
        created_by: user_id,
        type: "UPDATE",
      });

      return {
        success: !!result,
        code: result
          ? this.StatusCode.HTTP_OK
          : this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
        message: result
          ? this.ResMsg.PASSWORD_CHANGED
          : this.ResMsg.HTTP_INTERNAL_SERVER_ERROR,
      };
    });
  }
}

export default AdminProfileService;
