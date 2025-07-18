import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import HotelierJobPostService from "../services/hotelierJobPost.service";
import { HotelierJobPostValidator } from "../utils/validator/hotelierJobPost.validator";

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
  public getJobPostList = this.asyncWrapper.wrap(
    { querySchema: this.validator.getJobPostSchema },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getJobPostList(req);
      res.status(code).json(data);
    }
  );

  public getSingleJobPostWithJobSeekerDetails = this.asyncWrapper.wrap(
    { paramSchema: this.validator.getSingleJobPostSchema },
    async (req: Request, res: Response) => {
      const { code, ...data } =
        await this.service.getSingleJobPostWithJobSeekerDetails(req);
      res.status(code).json(data);
    }
  );

  public updateJobPost = this.asyncWrapper.wrap(
    {
      paramSchema: this.validator.getSingleJobPostSchema,
      bodySchema: this.validator.updateJobPostSchema,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateJobPost(req);
      res.status(code).json(data);
    }
  );

  public cancelJobPost = this.asyncWrapper.wrap(
    {
      paramSchema: this.validator.getSingleJobPostSchema,
      bodySchema: this.validator.cancelJobPostSchema,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.cancelJobPost(req);
      res.status(code).json(data);
    }
  );
  public trackJobSeekerLocation = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator,
      querySchema: this.validator.trackJobSeekerLocationSchema,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.trackJobSeekerLocation(req);
      res.status(code).json(data);
    }
  );
}
