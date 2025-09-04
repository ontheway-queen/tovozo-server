import AbstractRouter from "../../../abstract/abstract.router";
import { BankDetailsController } from "../controller/bankDetails.controller";

export class BankDetailsRouter extends AbstractRouter {
	private controller = new BankDetailsController();

	constructor() {
		super();
		this.callRouter();
	}

	private callRouter() {
		this.router
			.route("/")
			.get(this.controller.getBankAccounts)
			.post(this.controller.addBankAccounts);

		this.router.route("/:id").delete(this.controller.removeBankAccount);
	}
}
