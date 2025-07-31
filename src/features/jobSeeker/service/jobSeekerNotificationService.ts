import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import { USER_TYPE } from "../../../utils/miscellaneous/constants";

class JobSeekerNotificationService extends AbstractServices {
	public async getAllNotification(req: Request) {
		const user_id = req.jobSeeker.user_id;
		const model = this.Model.commonModel();
		const data = await model.getNotification({ ...req.query, user_id });
		return {
			success: true,
			message: this.ResMsg.HTTP_OK,
			code: this.StatusCode.HTTP_OK,
			...data,
		};
	}

	public async deleteNotification(req: Request) {
		const { user_id, id } = req.query as unknown as {
			user_id: number;
			id?: number;
		};

		return await this.db.transaction(async (trx) => {
			const model = this.Model.commonModel(trx);

			const getMyNotification = await model.getNotification({
				id: Number(id),
				user_id,
				limit: "1",
				need_total: false,
			});

			if (!getMyNotification.data.length) {
				return {
					success: false,
					message: this.ResMsg.HTTP_NOT_FOUND,
					code: this.StatusCode.HTTP_NOT_FOUND,
				};
			}
			if (
				getMyNotification.data[0].user_type.toLowerCase() ===
				USER_TYPE.ADMIN.toLowerCase()
			) {
				await this.insertAdminAudit(trx, {
					details: id
						? `Notification ${id} has been deleted`
						: "All Notification has been deleted.",
					created_by: user_id,
					endpoint: req.originalUrl,
					type: "DELETE",
				});
			}
			if (id) {
				await model.deleteNotification({
					notification_id: Number(id),
					user_id,
				});
			} else {
				const getAllNotification = await model.getNotification({
					user_id,
					limit: "1000",
					need_total: false,
				});

				const payload = getAllNotification.data
					.filter((notification) => Number.isInteger(notification.id))
					.map((notification) => ({
						notification_id: notification.id,
						user_id,
					}));

				if (payload.length) {
					await model.deleteNotification(payload);
				}
			}

			return {
				success: true,
				message: this.ResMsg.HTTP_OK,
				code: this.StatusCode.HTTP_OK,
			};
		});
	}

	public async readNotification(req: Request) {
		const { user_id, id } = req.query as unknown as {
			user_id: number;
			id?: number;
		};
		return await this.db.transaction(async (trx) => {
			const model = this.Model.commonModel(trx);

			const getMyNotification = await model.getNotification({
				id: Number(id),
				user_id,
				limit: "1",
				need_total: false,
			});

			if (!getMyNotification.data.length) {
				return {
					success: false,
					message: this.ResMsg.HTTP_NOT_FOUND,
					code: this.StatusCode.HTTP_NOT_FOUND,
				};
			}
			if (
				getMyNotification.data[0].user_type.toLowerCase() ===
				USER_TYPE.ADMIN.toLowerCase()
			) {
				await this.insertAdminAudit(trx, {
					details: id
						? `Notification ${id} has been read`
						: "All Notification has been read.",
					created_by: user_id,
					endpoint: req.originalUrl,
					type: "UPDATE",
				});
			}

			const data = await model.readNotification({
				notification_id: Number(id),
				user_id,
			});

			return {
				success: true,
				message: this.ResMsg.HTTP_OK,
				code: this.StatusCode.HTTP_OK,
			};
		});
	}
}

export default JobSeekerNotificationService;
