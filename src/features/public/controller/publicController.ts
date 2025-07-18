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

  public getAllNotification = this.asyncWrapper.wrap(
    { querySchema: this.commonValidator.getNotificationValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.services.getAllNotification(req);

      res.status(code).json(data);
    }
  );

  public deleteNotification = this.asyncWrapper.wrap(
    {
      querySchema: this.commonValidator.mutationNotificationValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.services.deleteNotification(req);
      res.status(code).json(data);
    }
  );

  public readNotification = this.asyncWrapper.wrap(
    {
      querySchema: this.commonValidator.mutationNotificationValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.services.readNotification(req);
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
  public getAllNationality = this.asyncWrapper.wrap(
    { querySchema: this.commonValidator.getNationality },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.services.getAllNationality(req);
      res.status(code).json(data);
    }
  );

  public getAllJob = this.asyncWrapper.wrap(
    { querySchema: this.commonValidator.getAllJobSchema },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.services.getAllJob(req);
      res.status(code).json(data);
    }
  );
}

export default PublicController;
