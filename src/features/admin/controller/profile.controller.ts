import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import AdminProfileService from "../services/profile.service";
import AdminAdministrationValidator from "../utils/validator/administration.validator";

class AdminProfileController extends AbstractController {
  private service = new AdminProfileService();
  private validator = new AdminAdministrationValidator();

  constructor() {
    super();
  }

  //get profile
  public getProfile = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getProfile(req);
      res.status(code).json(data);
    }
  );

  //edit profile
  public editProfile = this.asyncWrapper.wrap(
    { bodySchema: this.validator.editUserProfileValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.editProfile(req);
      res.status(code).json(data);
    }
  );

  //change password
  public changePassword = this.asyncWrapper.wrap(
    { bodySchema: this.commonValidator.changePassInputValidation },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.changePassword(req);
      res.status(code).json(data);
    }
  );
}

export default AdminProfileController;
