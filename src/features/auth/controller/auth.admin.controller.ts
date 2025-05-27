import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import AdminAuthService from "../services/auth.admin.servide";

export default class AdminAuthController extends AbstractController {
  private services = new AdminAuthService();
  constructor() {
    super();
  }

  // login
  public login = this.asyncWrapper.wrap(
    { bodySchema: this.commonValidator.loginValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.services.loginService(req);
      res.status(code).json(data);
    }
  );

  // forget pass
  public forgetPassword = this.asyncWrapper.wrap(
    { bodySchema: this.commonValidator.commonForgetPassInputValidation },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.services.forgetPassword(req);
      res.status(code).json(data);
    }
  );

  // get login data
  public loginData = this.asyncWrapper.wrap(
    { bodySchema: this.commonValidator.commonTwoFAInputValidation },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.services.LoginData(req);
      res.status(code).json(data);
    }
  );
}
