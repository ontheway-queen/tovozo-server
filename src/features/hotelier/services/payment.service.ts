import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import config from "../../../app/config";
import { getAllOnlineSocketIds, io } from "../../../app/socket";
import CustomError from "../../../utils/lib/customError";
import Lib from "../../../utils/lib/lib";
import {
	JOB_APPLICATION_STATUS,
	JOB_POST_DETAILS_STATUS,
	PAY_LEDGER_TRX_TYPE,
	PAYMENT_STATUS,
	PAYMENT_TYPE,
	USER_TYPE,
} from "../../../utils/miscellaneous/constants";
import { stripe } from "../../../utils/miscellaneous/stripe";
import {
	NotificationTypeEnum,
	TypeEmitNotificationEnum,
} from "../../../utils/modelTypes/common/commonModelTypes";
import { IPaymentUpdate } from "../../../utils/modelTypes/payment/paymentModelTypes";
import { TypeUser } from "../../../utils/modelTypes/user/userModelTypes";

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
		const { data, total } = await paymentModel.getPaymentsForHotelier(params);
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
		const data = await model.getSinglePaymentForHotelier(Number(id), user_id);
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
				throw new CustomError("Id not found", this.StatusCode.HTTP_NOT_FOUND);
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
			// const loginLink = await stripe.accounts.createLoginLink(
			// 	"acct_1RsFUAED98rhPWLe"
			// );
			// console.log("Login Link:", loginLink.url);

			const total_amount = Number(payment.total_amount);
			const jobSeekerPay = Number(payment.job_seeker_pay);

			const applicationFeeAmount = total_amount - jobSeekerPay;

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
							unit_amount: Math.round(total_amount * 100),
						},
						quantity: 1,
					},
				],
				payment_intent_data: {
					application_fee_amount: Math.round(applicationFeeAmount * 100),
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
				success_url: `${config.BASE_URL}/hotelier/payment/verify-checkout-session?session_id={CHECKOUT_SESSION_ID}`,
				cancel_url: `${config.BASE_URL}/hotelier/payment/cancelled`,
			});

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
		const { user_id } = req.hotelier;
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

			const chatModel = this.Model.chatModel(trx);
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

			const jobseeker = await this.Model.UserModel().checkUser({
				id: Number(paymentIntent.metadata.job_seeker_id),
			});
			if (jobseeker && jobseeker.length < 1) {
				throw new CustomError("User not found", this.StatusCode.HTTP_NOT_FOUND);
			}

			const paymentPayload = {
				payment_type: PAYMENT_TYPE.ONLINE_PAYMENT,
				status: PAYMENT_STATUS.PAID,
				trx_id: paymentIntent.id,
				paid_at: new Date(),
				paid_by: organization.id,
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
				await jobApplicationModel.updateMyJobApplicationStatus({
					application_id: payment.application_id,
					job_seeker_id: Number(paymentIntent.metadata.job_seeker_id),
					status: JOB_APPLICATION_STATUS.COMPLETED,
				});
			await jobPostModel.updateJobPostDetailsStatus({
				id: updatedApplication.job_post_details_id,
				status: JOB_POST_DETAILS_STATUS.Completed,
			});
			const chatSession = await chatModel.getChatSessionBetweenUsers({
				hotelier_id: user_id,
				job_seeker_id: Number(paymentIntent.metadata.job_seeker_id),
			});

			if (chatSession) {
				await chatModel.updateChatSession({
					session_id: chatSession.id,
					payload: {
						enable_chat: false,
					},
				});
			}
			await this.insertNotification(trx, TypeUser.JOB_SEEKER, {
				user_id: Number(paymentIntent.metadata.job_seeker_id),
				sender_id: user_id,
				sender_type: USER_TYPE.HOTELIER,
				title: this.NotificationMsg.PAYMENT_RECEIVED.title,
				content: this.NotificationMsg.PAYMENT_RECEIVED.content({
					jobTitle: paymentIntent.metadata.job_title,
					amount: Number(payment.job_seeker_pay),
				}),
				related_id: payment.id,
				type: NotificationTypeEnum.PAYMENT,
			});

			await this.insertNotification(trx, TypeUser.ADMIN, {
				user_id: Number(paymentIntent.metadata.job_seeker_id),
				sender_type: USER_TYPE.HOTELIER,
				title: this.NotificationMsg.PAYMENT_RECEIVED.title,
				content: this.NotificationMsg.PAYMENT_RECEIVED.content({
					jobTitle: paymentIntent.metadata.job_title,
					amount: Number(payment.platform_fee),
				}),
				related_id: payment.id,
				type: NotificationTypeEnum.PAYMENT,
			});

			const isJobSeekerOnline = await getAllOnlineSocketIds({
				user_id: Number(paymentIntent.metadata.job_seeker_id),
				type: TypeUser.JOB_SEEKER,
			});
			if (isJobSeekerOnline && isJobSeekerOnline.length > 0) {
				io.to(paymentIntent.metadata.job_seeker_id).emit(
					TypeEmitNotificationEnum.JOB_SEEKER_NEW_NOTIFICATION,
					{
						user_id: Number(paymentIntent.metadata.job_seeker_id),
						sender_id: user_id,
						sender_type: USER_TYPE.HOTELIER,
						title: this.NotificationMsg.PAYMENT_RECEIVED.title,
						content: this.NotificationMsg.PAYMENT_RECEIVED.content({
							jobTitle: paymentIntent.metadata.job_title,
							amount: Number(payment.job_seeker_pay),
						}),
						related_id: payment.id,
						type: NotificationTypeEnum.PAYMENT,
					}
				);
			} else {
				if (jobseeker[0].device_id) {
					await Lib.sendNotificationToMobile({
						to: jobseeker[0].device_id,
						notificationTitle: this.NotificationMsg.PAYMENT_RECEIVED.title,
						notificationBody: this.NotificationMsg.PAYMENT_RECEIVED.content({
							jobTitle: paymentIntent.metadata.job_title,
							amount: Number(payment.job_seeker_pay),
						}),
					});
				}
			}

			return {
				success: true,
				message: this.ResMsg.HTTP_OK,
				code: this.StatusCode.HTTP_OK,
				data: {
					trx_id: paymentIntent.id,
					paid_at: new Date(),
					status: PAYMENT_STATUS.PAID,
					total: payment.total_amount,
					job_seeker_name: paymentIntent.metadata.job_seeker_name,
					job_title: paymentIntent.metadata.job_title,
				},
			};
		});
	}

	// Ledger
	public async getAllPaymentLedgerForHotelier(req: Request) {
		const { limit, skip, search } = req.query;
		const { user_id } = req.hotelier;

		const paymentModel = this.Model.paymnentModel();
		const { data, total } = await paymentModel.getAllPaymentLedgerForHotelier({
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
