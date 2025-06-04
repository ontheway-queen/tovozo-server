import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import AdminJobService from "../services/jobs.services";
import AdminJobValidator from "../utils/validator/adminJob.validator";

class AdminJobController extends AbstractController {
  private service = new AdminJobService();
  private validator = new AdminJobValidator();

  constructor() {
    super();
  }

  public createJob = this.asyncWrapper.wrap(
    { bodySchema: this.validator.createJobSchema },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createJob(req);
      res.status(code).json(data);
    }
  );

  public getAllJob = this.asyncWrapper.wrap(
    { querySchema: this.validator.getAllJobSchema },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAllJob(req);
      res.status(code).json(data);
    }
  );

  public updateJob = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator,
      bodySchema: this.validator.updateJobSchema,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateJob(req);
      res.status(code).json(data);
    }
  );

  public deleteJob = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.deleteJob(req);
      res.status(code).json(data);
    }
  );
}

export default AdminJobController;
