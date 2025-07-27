import { Knex } from "knex";
import { db } from "../app/database";
import { getAllOnlineSocketIds } from "../app/socket";
import SocketService from "../features/public/services/socketService";
import Models from "../models/rootModel";
import ManageFile from "../utils/lib/manageFile";
import ResMsg from "../utils/miscellaneous/responseMessage";
import StatusCode from "../utils/miscellaneous/statusCode";
import { ICreateAdminAuditTrailPayload } from "../utils/modelTypes/admin/adminModelTypes";
import {
	INotificationPayload,
	NotificationTypeEnum,
	TypeEmitNotificationEnum,
} from "../utils/modelTypes/common/commonModelTypes";
import { TypeUser } from "../utils/modelTypes/user/userModelTypes";
import { QueueManager } from "../utils/queue/queue";
import { Queue } from "bullmq";

abstract class AbstractServices {
	protected db = db;
	protected manageFile = new ManageFile();
	protected ResMsg = ResMsg;
	private socketService = new SocketService();
	protected StatusCode = StatusCode;
	protected Model = new Models();

	private queueManager = QueueManager.getInstance();

	protected async insertAdminAudit(
		trx: Knex.Transaction,
		payload: ICreateAdminAuditTrailPayload
	) {
		const adminModel = this.Model.AdminModel(trx);

		await adminModel.createAudit(payload);
	}

	// Insert notification
	protected async insertNotification(
		trx: Knex.Transaction,
		userType: `${TypeUser}`,
		payload: INotificationPayload
	) {
		if (!payload.content || !payload.type || !payload.related_id) return;

		const commonModel = this.Model.commonModel(trx);
		const notificationPayload: INotificationPayload[] = [];
		let users: { user_id: number }[] = [];

		switch (userType) {
			case TypeUser.ADMIN: {
				const admins = await this.Model.AdminModel(trx).getAllAdmin(
					{},
					false
				);
				if (admins.data.length) {
					users = admins.data.map((admin) => ({
						user_id: admin.user_id,
					}));
				}
				break;
			}

			case TypeUser.JOB_SEEKER: {
				if (
					payload.type === NotificationTypeEnum.JOB_POST &&
					payload.user_id
				) {
					users = [{ user_id: payload.user_id }];
				} else {
					const seekers = await this.Model.UserModel(trx).checkUser({
						type: TypeUser.JOB_SEEKER,
					});
					users = seekers.map((u) => ({ user_id: u.id }));
				}
				break;
			}

			case TypeUser.HOTELIER: {
				if (
					payload.type === NotificationTypeEnum.JOB_TASK &&
					payload.user_id
				) {
					users = [{ user_id: payload.user_id }];
				} else {
					const hoteliers = await this.Model.UserModel(trx).checkUser(
						{
							type: TypeUser.HOTELIER,
						}
					);
					users = hoteliers.map((u) => ({ user_id: u.id }));
				}
				break;
			}

			default:
				return;
		}

		if (!users.length) return;

		for (const user of users) {
			notificationPayload.push({
				user_id: user.user_id,
				content: payload.content,
				related_id: payload.related_id,
				type: payload.type,
			});
		}

		// Emit to online users only
		const socketUsers = await getAllOnlineSocketIds({ type: userType });
		if (socketUsers.length) {
			const seenUserIds = new Set<number>();
			const emitType = this.getEmitType(userType as TypeUser);

			for (const { user_id, socketId } of socketUsers) {
				if (seenUserIds.has(user_id)) continue;
				this.socketService.emitNotification({
					user_id,
					socketId,
					content: payload.content,
					related_id: payload.related_id,
					type: payload.type,
					emitType,
				});
				seenUserIds.add(user_id);
			}
		}

		await commonModel.createNotification(notificationPayload);
	}

	private getEmitType(userType: TypeUser) {
		switch (userType) {
			case TypeUser.ADMIN:
				return TypeEmitNotificationEnum.ADMIN_NEW_NOTIFICATION;
			case TypeUser.HOTELIER:
				return TypeEmitNotificationEnum.HOTELIER_NEW_NOTIFICATION;
			case TypeUser.JOB_SEEKER:
			default:
				return TypeEmitNotificationEnum.JOB_SEEKER_NEW_NOTIFICATION;
		}
	}

	// Queue
	protected getQueue(queueName: string): Queue {
		return this.queueManager.getQueue(queueName);
	}
}

export default AbstractServices;
