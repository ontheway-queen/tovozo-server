import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import JobSeekerAuthService from "../services/auth.jobSeeker.service";

class JobSeekerAuthController extends AbstractController {
  private services = new JobSeekerAuthService();

  constructor() {
    super();
  }

  //register
  public registration = this.asyncWrapper.wrap(
    { bodySchema: this.commonValidator.registerJobSeekerValidator },
    // null,

    async (req: Request, res: Response) => {
      const { code, ...data } = await this.services.registrationService(req);
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
  public LoginData = this.asyncWrapper.wrap(
    { bodySchema: this.commonValidator.commonTwoFAInputValidation },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.services.LoginData(req);
      res.status(code).json(data);
    }
  );
}

export default JobSeekerAuthController;
