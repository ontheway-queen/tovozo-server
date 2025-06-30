import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import AdminJobPostService from "../services/jobPost.service";
import { HotelierJobPostValidator } from "../../hotelier/utils/validator/hotelierJobPost.validator";

export default class AdminJobPostController extends AbstractController {
	private service = new AdminJobPostService();
	private validator = new HotelierJobPostValidator();
	constructor() {
		super();
	}

	public getAllJobPosts = this.asyncWrapper.wrap(
		{ querySchema: this.validator.getJobPostSchema },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getAllJobPosts(req);
			res.status(code).json(data);
		}
	);

	public getSingleJobPost = this.asyncWrapper.wrap(
		{ paramSchema: this.validator.getSingleJobPostSchema },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getSingleJobPost(req);
			res.status(code).json(data);
		}
	);
}
