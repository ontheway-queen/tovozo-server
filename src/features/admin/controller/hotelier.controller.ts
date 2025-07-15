import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import AdminHotelierService from "../services/hotelier.services";
import AdminHotelierValidator from "../utils/validator/adminHotelier.validator";

class AdminHotelierController extends AbstractController {
  private service = new AdminHotelierService();
  private validator = new AdminHotelierValidator();
  constructor() {
    super();
  }

  public createHotelier = this.asyncWrapper.wrap(
    { bodySchema: this.validator.createHotelier },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createHotelier(req);
      res.status(code).json(data);
    }
  );

  public getHoteliers = this.asyncWrapper.wrap(
    { querySchema: this.validator.getHoteliersQuery },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getHoteliers(req);
      res.status(code).json(data);
    }
  );

  public getSingleHotelier = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getSingleHotelier(req);
      res.status(code).json(data);
    }
  );

  public updateHotelier = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator,
      bodySchema: this.validator.updateHotelier,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateHotelier(req);
      res.status(code).json(data);
    }
  );

  public deleteHotelier = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.deleteHotelier(req);
      res.status(code).json(data);
    }
  );
}

export default AdminHotelierController;
