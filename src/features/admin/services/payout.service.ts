import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import { getAllOnlineSocketIds, io } from "../../../app/socket";
import CustomError from "../../../utils/lib/customError";
import Lib from "../../../utils/lib/lib";
import {
	PAY_LEDGER_TRX_TYPE,
	PAYMENT_ENTRY_TYPE,
	USER_TYPE,
} from "../../../utils/miscellaneous/constants";
import {
	NotificationTypeEnum,
	TypeEmitNotificationEnum,
} from "../../../utils/modelTypes/common/commonModelTypes";
import { TypeUser } from "../../../utils/modelTypes/user/userModelTypes";

export default class AdminPayoutService extends AbstractServices {
	constructor() {
		super();
	}

	public async getAllPayouts(req: Request) {
		const { name, limit, skip } = req.query;
		const payoutModel = this.Model.payoutModel();
		const { data, total } = await payoutModel.getAllPayoutForAdmin({
			search: name as string,
			limit: Number(limit),
			skip: Number(skip),
		});

		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			message: this.ResMsg.HTTP_OK,
			total,
			data,
		};
	}

	public async getSinglePayout(req: Request) {
		const id = Number(req.params.id);
		console.log({ id });
		const payoutModel = this.Model.payoutModel();
		const data = await payoutModel.getSinglePayout({
			id,
		});

		if (!data) {
			return {
				success: true,
				code: this.StatusCode.HTTP_NOT_FOUND,
				message: this.ResMsg.HTTP_NOT_FOUND,
			};
		}
		return {
			success: true,
			code: this.StatusCode.HTTP_OK,
			message: this.ResMsg.HTTP_OK,
			data,
		};
	}

	public async managePayout(req: Request) {
		return await this.db.transaction(async (trx) => {
			const { user_id: adminUserId } = req.admin;
			const id = Number(req.params.id);
			const body = req.body;

			const payoutModel = this.Model.payoutModel(trx);
			const paymentModel = this.Model.paymnentModel(trx);

			const payout = await payoutModel.getSinglePayout({ id });

			if (!payout) {
				throw new CustomError(
					"Payout request not found!",
					this.StatusCode.HTTP_NOT_FOUND
				);
			}

			const payload = {
				...body,
				managed_at: new Date(),
				managed_by: adminUserId,
				voucher_no: `TVZ-WD-${Date.now()}`,
			};

			await payoutModel.managePayout({ id: id, payload });

			const baseLedgerPayload = {
				voucher_no: `TVZ-WD-${Date.now()}`,
				ledger_date: new Date(),
				created_at: new Date(),
				updated_at: new Date(),
			};
			await paymentModel.createPaymentLedger({
				...baseLedgerPayload,
				user_id: payout.job_seeker_id,
				trx_type: PAY_LEDGER_TRX_TYPE.OUT,
				entry_type: PAYMENT_ENTRY_TYPE.WITHDRAW,
				user_type: USER_TYPE.JOB_SEEKER,
				amount: Number(payout.amount),
				details: `Withdrawal of ${payout.amount} processed successfully.`,
			});

			// 🔹 Insert audit log
			await this.insertAdminAudit(trx, {
				created_by: adminUserId,
				type: "UPDATE",
				endpoint: `${req.method} ${req.originalUrl}`,
				details:
					body.status === "Approved"
						? `Admin ${adminUserId} approved payout #${id} with transaction reference ${body.transaction_reference}`
						: `Admin ${adminUserId} ${body.status.toLowerCase()} payout #${id}`,
				payload: JSON.stringify(payload),
			});

			// 🔹 Build notification for jobseeker
			const jobSeekerId = payout.job_seeker_id;

			const notificationTitle =
				body.status === "Approved"
					? "Your payout request has been approved 🎉"
					: "Your payout request has been rejected ❌";

			const notificationContent =
				body.status === "Approved"
					? `Your payout request #${id} has been approved. Transaction Ref: ${body.transaction_reference}`
					: `Your payout request #${id} has been rejected. Please check admin note for details.`;

			await this.insertNotification(trx, USER_TYPE.JOB_SEEKER, {
				title: notificationTitle,
				content: notificationContent,
				related_id: id,
				sender_type: USER_TYPE.ADMIN,
				sender_id: adminUserId,
				user_id: jobSeekerId,
				type: NotificationTypeEnum.PAYMENT,
			});

			const isJobSeekerOnline = await getAllOnlineSocketIds({
				user_id: jobSeekerId,
				type: TypeUser.JOB_SEEKER,
			});

			if (isJobSeekerOnline && isJobSeekerOnline.length > 0) {
				io.to(String(jobSeekerId)).emit(
					TypeEmitNotificationEnum.JOB_SEEKER_NEW_NOTIFICATION,
					{
						user_id: jobSeekerId,
						title: notificationTitle,
						content: notificationContent,
						related_id: id,
						type: NotificationTypeEnum.PAYOUT,
						read_status: false,
						created_at: new Date().toISOString(),
					}
				);
			} else {
				const isJobSeekerExists =
					await this.Model.UserModel().checkUser({ id: jobSeekerId });

				if (isJobSeekerExists[0]?.device_id) {
					await Lib.sendNotificationToMobile({
						to: isJobSeekerExists[0].device_id as string,
						notificationTitle: notificationTitle,
						notificationBody: notificationContent,
						// data: JSON.stringify({
						// 	related_id: id,
						// }),
					});
				}
			}

			return {
				success: true,
				code: this.StatusCode.HTTP_OK,
				message: this.ResMsg.HTTP_OK,
			};
		});
	}
}
