import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import HotelierAuthService from "../services/auth.hotelier.service";

export default class HotelierAuthController extends AbstractController {
  private services = new HotelierAuthService();
  constructor() {
    super();
  }

  //register
  public registration = this.asyncWrapper.wrap(
    { bodySchema: this.commonValidator.registerOrganizationValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } =
        await this.services.organizationRegistrationService(req);
      res.status(code).json(data);
    }
  );

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
      const { code, ...data } = await this.services.loginData(req);
      res.status(code).json(data);
    }
  );
}
