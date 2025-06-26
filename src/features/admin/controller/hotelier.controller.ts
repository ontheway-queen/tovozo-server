import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import AdminHotelierService from "../services/hotelier.services";

class AdminHotelierController extends AbstractController {
  private service = new AdminHotelierService();
  constructor() {
    super();
  }

  public createHotelier = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createHotelier(req);
      res.status(code).json(data);
    }
  );
}

export default AdminHotelierController;
