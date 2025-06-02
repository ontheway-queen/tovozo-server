import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import PublicService from "../services/publicService";

class PublicController extends AbstractController {
  private services = new PublicService();
  constructor() {
    super();
  }
  //send email otp
  public sendEmailOtpController = this.asyncWrapper.wrap(
    { bodySchema: this.commonValidator.sendOtpInputValidator },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.sendOtpToEmailService(req);
      res.status(code).json(rest);
    }
  );

  // match email otp
  public matchEmailOtpController = this.asyncWrapper.wrap(
    { bodySchema: this.commonValidator.matchEmailOtpInputValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.services.matchEmailOtpService(req);

      res.status(code).json(data);
    }
  );

  //get all country
  public getAllCountry = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.services.getAllCountry(req);
      res.status(code).json(data);
    }
  );

  //get all city
  public getAllCity = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.services.getAllCity(req);
      res.status(code).json(data);
    }
  );

  // get all states
  public getAllStates = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.services.getAllStates(req);
      res.status(code).json(data);
    }
  );
}

export default PublicController;
