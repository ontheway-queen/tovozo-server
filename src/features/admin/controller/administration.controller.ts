import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import AdminAdministrationService from "../services/administration.service";
import AdminAdministrationValidator from "../utils/validator/administration.validator";

class AdminAdministrationController extends AbstractController {
  private service = new AdminAdministrationService();
  private validator = new AdminAdministrationValidator();

  constructor() {
    super();
  }

  //create role
  public createRole = this.asyncWrapper.wrap(
    { bodySchema: this.validator.createRole },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createRole(req);
      res.status(code).json(data);
    }
  );

  //role list
  public roleList = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.roleList(req);
      res.status(code).json(data);
    }
  );

  //create permission
  public createPermission = this.asyncWrapper.wrap(
    { bodySchema: this.validator.createPermission },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createPermission(req);
      res.status(code).json(data);
    }
  );

  //permission list
  public permissionList = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.permissionList(req);
      res.status(code).json(data);
    }
  );

  //get single role permission
  public getSingleRolePermission = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getSingleRolePermission(req);
      res.status(code).json(data);
    }
  );

  //update role permission
  public updateRolePermissions = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator,
      bodySchema: this.validator.updateRolePermissions,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateRolePermissions(req);
      res.status(code).json(data);
    }
  );

  //create admin
  public createAdmin = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.createAdmin,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createAdmin(req);
      res.status(code).json(data);
    }
  );

  //get all admin
  public getAllAdmin = this.asyncWrapper.wrap(
    { querySchema: this.validator.getAllAdminQueryValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllAdmin(req);
      res.status(code).json(data);
    }
  );

  //get single admin
  public getSingleAdmin = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getSingleAdmin(req);
      res.status(code).json(data);
    }
  );

  //update admin
  public updateAdmin = this.asyncWrapper.wrap(
    { bodySchema: this.validator.updateAdmin },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateAdmin(req);
      res.status(code).json(data);
    }
  );
}

export default AdminAdministrationController;
