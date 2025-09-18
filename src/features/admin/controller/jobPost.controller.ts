import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import { HotelierJobPostValidator } from "../../hotelier/utils/validator/hotelierJobPost.validator";
import AdminJobPostService from "../services/jobPost.service";

export default class AdminJobPostController extends AbstractController {
	private service = new AdminJobPostService();
	private validator = new HotelierJobPostValidator();
	constructor() {
		super();
	}

	public getJobPostListForAdmin = this.asyncWrapper.wrap(
		{ querySchema: this.validator.getJobPostSchema },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getJobPostListForAdmin(
				req
			);
			res.status(code).json(data);
		}
	);

	public getSingleJobPostForAdmin = this.asyncWrapper.wrap(
		{ paramSchema: this.validator.getSingleJobPostSchema },
		async (req: Request, res: Response) => {
			const { code, ...data } =
				await this.service.getSingleJobPostForAdmin(req);
			res.status(code).json(data);
		}
	);

	public cancelJobPostByAdmin = this.asyncWrapper.wrap(
		{ paramSchema: this.validator.getSingleJobPostSchema },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.cancelJobPostByAdmin(
				req
			);
			res.status(code).json(data);
		}
	);
}
