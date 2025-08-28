import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import PayoutRequestsService from "../services/payoutRequests.service";

export default class PayoutRequestsController extends AbstractController {
	private service = new PayoutRequestsService();
	constructor() {
		super();
	}

	public getAllPayoutRequests = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getAllPayoutRequests(
				req
			);
			res.status(code).json(data);
		}
	);
}
