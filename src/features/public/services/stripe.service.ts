import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import { stripe } from "../../../utils/miscellaneous/stripe";

export default class StripeService extends AbstractServices {
	constructor() {
		super();
	}

	public async createPayment(req: Request) {
		return await this.db.transaction(async (trx) => {
			const userModel = this.Model.UserModel(trx);
		});
	}

	public async onboardComplete(req: Request) {
		console.log({ req });
		const { user_id } = req.admin;
		const stripe_acc_id = req.query.stripe_acc_id as string;

		if (!stripe_acc_id) {
			throw new Error("Stripe account ID is required");
		}

		const account = await stripe.accounts.retrieve(stripe_acc_id);
		console.log({ account });
		if (!account.payouts_enabled) {
			// 🔥 Delete the Stripe account from Connect dashboard
			await stripe.accounts.del(stripe_acc_id);

			return {
				success: false,
				code: this.StatusCode.HTTP_BAD_REQUEST,
				message:
					"Stripe account not eligible. Account has been deleted.",
			};
		}

		// ✅ Save if verified
		await this.Model.UserModel().addStripePayoutAccount({
			user_id,
			stripe_acc_id,
		});

		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			message: this.ResMsg.HTTP_OK,
			data: { message: "Onboarding completed successfully" },
		};
	}
}
