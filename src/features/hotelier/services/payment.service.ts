import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import { stripe } from "../../../utils/miscellaneous/stripe";
import CustomError from "../../../utils/lib/customError";
import {
	JOB_APPLICATION_STATUS,
	JOB_POST_DETAILS_STATUS,
	PAY_LEDGER_TRX_TYPE,
	PAYMENT_STATUS,
	PAYMENT_TYPE,
	USER_TYPE,
} from "../../../utils/miscellaneous/constants";
import {
	IPaymentLedgerPayload,
	IPaymentUpdate,
} from "../../../utils/modelTypes/payment/paymentModelTypes";

export default class PaymentService extends AbstractServices {
	constructor() {
		super();
	}

	public async getPaymentsForHotelier(req: Request) {
		const { limit, skip, search, status } = req.query;
		const { user_id } = req.hotelier;
		const params = {
			hotelier_id: user_id,
			limit: Number(limit) || 100,
			skip: Number(skip) || 0,
			search: search ? String(search) : "",
			status: status ? String(status) : undefined,
		};
		const paymentModel = this.Model.paymnentModel();
		const { data, total } = await paymentModel.getPaymentsForHotelier(
			params
		);
		return {
			success: true,
			message: this.ResMsg.HTTP_OK,
			code: this.StatusCode.HTTP_OK,
			data,
			total,
		};
	}

	public async getSinglePaymentForHotelier(req: Request) {
		const { user_id } = req.hotelier;
		const id = req.params.id;

		const model = this.Model.paymnentModel();
		const data = await model.getSinglePaymentForHotelier(
			Number(id),
			user_id
		);
		if (!data) {
			throw new CustomError(
				"The requested pay slip not found",
				this.StatusCode.HTTP_NOT_FOUND
			);
		}

		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			message: this.ResMsg.HTTP_OK,
			data,
		};
	}

	public async createCheckoutSession(req: Request) {
		try {
			const { job_title, job_seeker_id, job_seeker_name, stripe_acc_id } =
				req.body;
			const id = Number(req.params.id);
			const { user_id } = req.hotelier;

			if (!id) {
				throw new CustomError(
					"Id not found",
					this.StatusCode.HTTP_NOT_FOUND
				);
			}

			const paymentModel = this.Model.paymnentModel();
			const payment = await paymentModel.getSinglePayment(id);
			if (!payment) {
				throw new CustomError(
					"Payment record not found",
					this.StatusCode.HTTP_NOT_FOUND,
					"ERROR"
				);
			}
			if (payment.status === PAYMENT_STATUS.PAID) {
				throw new CustomError(
					"The payment is already paid",
					this.StatusCode.HTTP_CONFLICT
				);
			}

			const loginLink = await stripe.accounts.createLoginLink(
				"acct_1RnAa4FSzTsJiGrd"
			);
			console.log("Login Link:", loginLink.url);

			// const account = await stripe.accounts.retrieve(
			// 	"acct_1Rmu4JFbg6WrkTSf"
			// );
			// console.log(account?.settings?.payouts?.schedule);

			const session = await stripe.checkout.sessions.create({
				payment_method_types: ["card"],
				mode: "payment",
				line_items: [
					{
						price_data: {
							currency: "usd",
							product_data: {
								name: `Payment for ${job_title} by ${job_seeker_name}`,
							},
							unit_amount: Math.round(payment.total_amount * 100),
						},
						quantity: 1,
					},
				],
				payment_intent_data: {
					application_fee_amount: Math.round(
						payment.platform_fee * 100
					),
					transfer_data: {
						destination: stripe_acc_id,
					},
					metadata: {
						id,
						job_seeker_id,
						job_title,
						job_seeker_name,
						paid_by: user_id,
					},
				},
				success_url: `https://tovozo.com/payment/success?session_id={CHECKOUT_SESSION_ID}`,
				cancel_url: `https://tovozo.com/payment/cancelled`,
			});

			console.log({ session });

			return {
				success: true,
				message: this.ResMsg.HTTP_OK,
				code: this.StatusCode.HTTP_OK,
				data: { url: session.url },
			};
		} catch (error: any) {
			throw new CustomError(
				error instanceof Error && error.message
					? error.message
					: "An error occurred while creating the checkout session",
				this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
				"ERROR"
			);
		}
	}

	public async verifyCheckoutSession(req: Request) {
		return await this.db.transaction(async (trx) => {
			const sessionId = req.query.session_id as string;
			const { user_id } = req.hotelier;

			if (!user_id) {
				throw new CustomError(
					"Hotelier ID is required",
					this.StatusCode.HTTP_BAD_REQUEST,
					"ERROR"
				);
			}

			if (!sessionId) {
				throw new CustomError(
					"Session ID is required",
					this.StatusCode.HTTP_BAD_REQUEST,
					"ERROR"
				);
			}

			const organizationModel = this.Model.organizationModel(trx);
			const paymentModel = this.Model.paymnentModel(trx);
			const jobApplicationModel = this.Model.jobApplicationModel(trx);
			const jobPostModel = this.Model.jobPostModel(trx);

			const organization = await organizationModel.getOrganization({
				user_id,
			});
			if (!organization) {
				throw new CustomError(
					"Organization not found for the provided Hotelier ID",
					this.StatusCode.HTTP_NOT_FOUND,
					"ERROR"
				);
			}

			const session = await stripe.checkout.sessions.retrieve(sessionId);
			if (!session || session.payment_status !== "paid") {
				throw new CustomError(
					"Payment not completed or session not found",
					this.StatusCode.HTTP_BAD_REQUEST,
					"ERROR"
				);
			}

			const paymentIntentId = session.payment_intent as string;
			const transactionId = paymentIntentId.slice(-10);

			const paymentIntent = await stripe.paymentIntents.retrieve(
				paymentIntentId,
				{
					expand: ["charges"],
				}
			);

			const payment = await paymentModel.getSinglePayment(
				Number(paymentIntent.metadata.id)
			);
			if (!payment) {
				throw new CustomError(
					"Payment record not found",
					this.StatusCode.HTTP_NOT_FOUND,
					"ERROR"
				);
			}
			if (payment.status === "paid") {
				throw new CustomError(
					"The payment is aleady paid",
					this.StatusCode.HTTP_CONFLICT
				);
			}
			console.log({ 1: payment.status });
			const charge = await stripe.charges.retrieve(
				paymentIntent.latest_charge as string
			);
			const balanceTransaction =
				await stripe.balanceTransactions.retrieve(
					charge.balance_transaction as string
				);

			const stripeFeeInCents = balanceTransaction.fee;

			const paymentPayload = {
				payment_type: PAYMENT_TYPE.ONLINE_PAYMENT,
				status: PAYMENT_STATUS.PAID,
				trx_id: `TRX-${transactionId}`,
				paid_at: new Date(),
				paid_by: organization.id,
				trx_fee: (stripeFeeInCents / 100).toFixed(2),
			};

			await paymentModel.updatePayment(
				Number(paymentIntent.metadata.id),
				paymentPayload as unknown as IPaymentUpdate
			);

			const baseLedgerPayload = {
				payment_id: payment.id,
				voucher_no: payment.payment_no,
				ledger_date: new Date(),
				created_at: new Date(),
				updated_at: new Date(),
				trx_id: `TRX-${transactionId}`,
			};

			await paymentModel.createPaymentLedger({
				...baseLedgerPayload,
				user_id: paymentIntent.metadata.job_seeker_id,
				trx_type: PAY_LEDGER_TRX_TYPE.IN,
				user_type: USER_TYPE.JOB_SEEKER,
				amount: payment.job_seeker_pay,
				details: `Payment received for job "${paymentIntent.metadata.job_title}".`,
			});

			await paymentModel.createPaymentLedger({
				...baseLedgerPayload,
				trx_type: PAY_LEDGER_TRX_TYPE.IN,
				user_type: USER_TYPE.ADMIN,
				amount: payment.platform_fee,
				details: `Platform fee received from job "${paymentIntent.metadata.job_title}" completed by ${paymentIntent.metadata.job_seeker_name}`,
			});

			await paymentModel.createPaymentLedger({
				...baseLedgerPayload,
				user_id: user_id,
				trx_type: PAY_LEDGER_TRX_TYPE.OUT,
				user_type: USER_TYPE.HOTELIER,
				amount: payment.total_amount,
				details: `Payment sent for job "${paymentIntent.metadata.job_title}" to ${paymentIntent.metadata.job_seeker_name}.`,
			});

			const updatedApplication =
				await jobApplicationModel.updateMyJobApplicationStatus(
					payment.application_id,
					Number(paymentIntent.metadata.job_seeker_id),
					JOB_APPLICATION_STATUS.COMPLETED
				);
			await jobPostModel.updateJobPostDetailsStatus(
				updatedApplication.job_post_details_id,
				JOB_POST_DETAILS_STATUS.Completed
			);
			return {
				success: true,
				message: this.ResMsg.HTTP_OK,
				code: this.StatusCode.HTTP_OK,
			};
		});
	}

	// Ledger
	public async getAllPaymentLedgerForHotelier(req: Request) {
		const { limit, skip, search } = req.query;
		const { user_id } = req.hotelier;

		const paymentModel = this.Model.paymnentModel();
		const { data, total } =
			await paymentModel.getAllPaymentLedgerForHotelier({
				limit: Number(limit) || 100,
				skip: Number(skip) || 0,
				search: search ? String(search) : "",
				user_id,
			});

		return {
			success: true,
			message: this.ResMsg.HTTP_OK,
			code: this.StatusCode.HTTP_OK,
			data,
			total,
		};
	}
}
