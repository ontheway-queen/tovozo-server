import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import HotelierJobPostService from "../services/hotelierJobPost.service";
import { HotelierJobPostValidator } from "../utils/validator/HotelierJobPostValidator";

export default class HotelierJobPostController extends AbstractController {
  private service = new HotelierJobPostService();
  private validator = new HotelierJobPostValidator();
  constructor() {
    super();
  }

  public createJobPost = this.asyncWrapper.wrap(
    { bodySchema: this.validator.createJobPostSchema },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createJobPost(req);
      res.status(code).json(data);
    }
  );
}
