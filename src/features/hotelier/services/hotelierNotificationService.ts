import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";

class HotelierNotificationService extends AbstractServices {
	public async getAllNotification(req: Request) {
		const user_id = req.hotelier.user_id;
		const model = this.Model.commonModel();

		const data = await model.getNotification({ ...req.query, user_id });
		const { data: notifications } = data;
		if (notifications && notifications.length > 0) {
			const filteredNotifications = notifications.filter(
				(notification) => notification.is_read === false
			);
			const unreadNotifications = filteredNotifications.map((notification) => {
				return {
					user_id,
					notification_id: notification.id,
				};
			});

			if (unreadNotifications.length > 0) {
				await model.readNotification(unreadNotifications);
			}
		}
		return {
			success: true,
			message: this.ResMsg.HTTP_OK,
			code: this.StatusCode.HTTP_OK,
			...data,
		};
	}

	public async deleteNotification(req: Request) {
		const { user_id } = req.hotelier;
		const { id } = req.query as unknown as {
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
		const { user_id } = req.hotelier;
		const { id } = req.query as unknown as {
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

			await model.readNotification({
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

export default HotelierNotificationService;
