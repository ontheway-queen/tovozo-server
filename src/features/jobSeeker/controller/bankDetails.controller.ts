import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import BankDetailsService from "../service/bankDetails.service";
import BankDetailsValidator from "../utils/validator/bankDetails.validator";

export class BankDetailsController extends AbstractController {
	private service = new BankDetailsService();
	private validator = new BankDetailsValidator();

	constructor() {
		super();
	}

	public getBankAccounts = this.asyncWrapper.wrap(
		{ querySchema: this.validator.getBankDetailsQueryValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getBankAccounts(req);
			res.status(code).json(data);
		}
	);

	public addBankAccounts = this.asyncWrapper.wrap(
		{ bodySchema: this.validator.addBankDetailsPayloadValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.addBankAccounts(req);
			res.status(code).json(data);
		}
	);

	public removeBankAccount = this.asyncWrapper.wrap(
		{ paramSchema: this.commonValidator.singleParamNumValidator() },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.removeBankAccount(req);
			res.status(code).json(data);
		}
	);
}
