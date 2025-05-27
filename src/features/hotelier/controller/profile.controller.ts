import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import HotelierProfileService from "../services/profile.service";

export default class HotelierProfileController extends AbstractController {
  private profileService = new HotelierProfileService();
  constructor() {
    super();
  }

  // get profile
  public getProfile = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.profileService.getProfile(req);
      res.status(code).json(data);
    }
  );

  //change password
  public changePassword = this.asyncWrapper.wrap(
    { bodySchema: this.commonValidator.changePassInputValidation },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.profileService.changePassword(req);
      res.status(code).json(data);
    }
  );
}
