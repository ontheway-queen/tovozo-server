import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import config from "../../../app/config";
import Lib from "../../../utils/lib/lib";
import {
  LOGIN_TOKEN_EXPIRES_IN,
  USER_AUTHENTICATION_VIEW,
  USER_TYPE,
} from "../../../utils/miscellaneous/constants";
import { IForgetPasswordPayload } from "../../../utils/modelTypes/common/commonModelTypes";

class AdminAuthService extends AbstractServices {
  //login
  public async loginService(req: Request) {
    const { email, password } = req.body as { email: string; password: string };
    return await this.db.transaction(async (trx) => {
      const userModel = this.Model.UserModel(trx);
      const checkUser = await userModel.getSingleCommonAuthUser({
        schema_name: "admin",
        table_name: USER_AUTHENTICATION_VIEW.ADMIN,
        email,
      });

      if (!checkUser) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: this.ResMsg.WRONG_CREDENTIALS,
        };
      }

      const { password_hash: hashPass, ...rest } = checkUser;
      const checkPass = await Lib.compareHashValue(password, hashPass);

      if (!checkPass) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: this.ResMsg.WRONG_CREDENTIALS,
        };
      }

      if (!rest.user_status) {
        return {
          success: false,
          code: this.StatusCode.HTTP_FORBIDDEN,
          message: `Account Inactive: Your account status is 'Inactive'.`,
        };
      }

      if (rest.is_2fa_on) {
        return {
          success: true,
          code: this.StatusCode.HTTP_OK,
          message: this.ResMsg.LOGIN_SUCCESSFUL,
          data: {
            email: rest.email,
            is_2fa_on: true,
          },
        };
      } else {
        await this.insertAdminAudit(trx, {
          details: `Admin User ${rest.username}(${rest.email}) has logged in.`,
          endpoint: `${req.method} ${req.originalUrl}`,
          created_by: rest.user_id,
          type: "CREATE",
        });
        const token_data = {
          user_id: rest.user_id,
          username: rest.username,
          name: rest.name,
          gender: rest.gender,
          phone_number: rest.phone_number,
          role_id: rest.role_id,
          photo: rest.photo,
          status: rest.user_status,
          email: rest.email,
        };

        const token = Lib.createToken(
          token_data,
          config.JWT_SECRET_ADMIN,
          LOGIN_TOKEN_EXPIRES_IN
        );
        return {
          success: true,
          code: this.StatusCode.HTTP_OK,
          message: this.ResMsg.LOGIN_SUCCESSFUL,
          data: rest,
          token,
        };
      }
    });
  }

  // The loginData is used to retrieve user information after successfully verifying the user through two-factor authentication.
  public async LoginData(req: Request) {
    const { token, email } = req.body as { token: string; email: string };
    const token_verify: any = Lib.verifyToken(token, config.JWT_SECRET_ADMIN);
    const user_model = this.Model.UserModel();
    if (!token_verify) {
      return {
        success: false,
        code: this.StatusCode.HTTP_UNAUTHORIZED,
        message: this.ResMsg.HTTP_UNAUTHORIZED,
      };
    }

    const { email: verify_email } = token_verify;
    if (email === verify_email) {
      const checkUser = await user_model.getSingleCommonAuthUser({
        schema_name: "admin",
        table_name: USER_AUTHENTICATION_VIEW.ADMIN,
        email,
      });

      if (!checkUser) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: this.ResMsg.WRONG_CREDENTIALS,
        };
      }

      const { password_hash: hashPass, agency_id, ...rest } = checkUser;

      if (!rest.user_status) {
        return {
          success: false,
          code: this.StatusCode.HTTP_FORBIDDEN,
          message: `Account Inactive: Your account status is 'Inactive'.`,
        };
      }

      const token_data = {
        user_id: rest.user_id,
        username: rest.username,
        name: rest.name,
        gender: rest.gender,
        phone_number: rest.phone_number,
        role_id: rest.role_id,
        photo: rest.photo,
        status: rest.user_status,
        email: rest.email,
      };

      const token = Lib.createToken(
        token_data,
        config.JWT_SECRET_ADMIN,
        LOGIN_TOKEN_EXPIRES_IN
      );
      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.LOGIN_SUCCESSFUL,
        data: token_data,
        token,
      };
    } else {
      return {
        success: false,
        code: this.StatusCode.HTTP_FORBIDDEN,
        message: this.StatusCode.HTTP_FORBIDDEN,
      };
    }
  }

  //forget pass
  public async forgetPassword(req: Request) {
    const { token, email, password } = req.body as IForgetPasswordPayload;
    const token_verify: any = Lib.verifyToken(token, config.JWT_SECRET_ADMIN);

    if (!token_verify) {
      return {
        success: false,
        code: this.StatusCode.HTTP_UNAUTHORIZED,
        message: this.ResMsg.HTTP_UNAUTHORIZED,
      };
    }

    const { email: verify_email } = token_verify;
    if (email === verify_email) {
      const hashed_pass = await Lib.hashValue(password);
      const model = this.Model.UserModel();
      const [get_user] = await model.checkUser({
        email,
        type: USER_TYPE.ADMIN,
      });
      await model.updateProfile(
        { password_hash: hashed_pass },
        { id: get_user.id }
      );
      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.PASSWORD_CHANGED,
      };
    } else {
      return {
        success: false,
        code: this.StatusCode.HTTP_FORBIDDEN,
        message: this.StatusCode.HTTP_FORBIDDEN,
      };
    }
  }
}

export default AdminAuthService;
