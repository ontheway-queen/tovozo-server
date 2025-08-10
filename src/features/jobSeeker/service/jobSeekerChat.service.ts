import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import { io } from "../../../app/socket";
import { TypeEmitNotificationEnum } from "../../../utils/modelTypes/common/commonModelTypes";
import { TypeUser } from "../../../utils/modelTypes/user/userModelTypes";
import CustomError from "../../../utils/lib/customError";

export class JobSeekerChatService extends AbstractServices {
	constructor() {
		super();
	}

	public async getChatSessions(req: Request) {
		const { user_id } = req.jobSeeker;
		const { name } = req.query;
		const chatModel = this.Model.chatModel();
		const data = await chatModel.getChatSessions({
			user_id,
			name: name as string,
		});

		return {
			success: true,
			message: this.ResMsg.HTTP_OK,
			code: this.StatusCode.HTTP_OK,
			data,
		};
	}

	public async getMessages(req: Request) {
		const { user_id } = req.jobSeeker;
		const session_id = Number(req.query.session_id);
		const limit = Number(req.query.limit);
		const skip = Number(req.query.skip);
		const chatModel = this.Model.chatModel();
		const data = await chatModel.getMessages({
			user_id,
			chat_session_id: session_id,
			limit,
			skip,
		});

		return {
			success: true,
			message: this.ResMsg.HTTP_OK,
			code: this.StatusCode.HTTP_OK,
			data,
		};
	}

	public async sendMessage(req: Request) {
		const { user_id } = req.jobSeeker;
		const { message, chat_session_id } = req.body;

		return await this.db.transaction(async (trx) => {
			const chatModel = this.Model.chatModel(trx);

			const isSessionExists = await chatModel.getChatSessionById(
				chat_session_id
			);
			if (isSessionExists && !isSessionExists.enable_chat) {
				throw new CustomError(
					"This chat session is closed and no longer accepts new messages.",
					this.StatusCode.HTTP_FORBIDDEN
				);
			}

			const messagePayload = {
				sender_id: user_id,
				message,
				chat_session_id,
			};

			const newMessage = await chatModel.sendMessage(messagePayload);

			await chatModel.updateChatSession({
				session_id: chat_session_id,
				payload: {
					last_message: message,
					last_message_at: new Date(),
				},
			});

			io.to(`chat:${chat_session_id}`).emit("chat:receive", {
				id: newMessage[0].id,
				message,
				created_at: newMessage[0].created_at,
			});

			return {
				success: true,
				message: this.ResMsg.HTTP_OK,
				code: this.StatusCode.HTTP_OK,
				data: {
					id: newMessage[0].id,
					message,
					created_at: newMessage[0].created_at,
				},
			};
		});
	}

	public async getSupportSession(req: Request) {
		const userModel = this.Model.UserModel();
		const chatModel = this.Model.chatModel();
		const { user_id } = req.jobSeeker;

		const checkUser = await userModel.checkUser({ id: user_id });
		if (checkUser && checkUser.length < 1) {
			throw new CustomError(
				"User not found!",
				this.StatusCode.HTTP_NOT_FOUND
			);
		}

		let chatSession = await chatModel.checkSupportSession(user_id);
		console.log({ chatSession });
		if (chatSession) {
			const chat_session_id = chatSession.id;
			console.log({ chat_session_id });

			const existingParticipants = await chatModel.getSessionParticipants(
				chat_session_id
			);
			console.log({ existingParticipants });
			const existingAdminIds = new Set(
				existingParticipants
					.filter((p: any) => p.type === TypeUser.ADMIN)
					.map((p: any) => p.user_id)
			);

			const admins = await userModel.checkUser({ type: TypeUser.ADMIN });

			const newAdmins = admins.filter(
				(admin) => !existingAdminIds.has(admin.id)
			);
			if (newAdmins.length) {
				const newAdminParticipants = newAdmins.map((admin) => ({
					chat_session_id,
					user_id: admin.id,
					type: TypeUser.ADMIN,
					joined_at: new Date(),
				}));

				await chatModel.createChatSessionParticipants(
					newAdminParticipants
				);
			}

			return {
				success: true,
				message: this.ResMsg.HTTP_OK,
				code: this.StatusCode.HTTP_OK,
				data: chat_session_id,
			};
		}

		const newSession = await chatModel.createChatSession({});
		const chat_session_id = newSession[0].id;

		await chatModel.createChatSessionParticipants([
			{
				chat_session_id,
				user_id,
				type: TypeUser.JOB_SEEKER,
				joined_at: new Date(),
			},
		]);

		const admins = await userModel.checkUser({ type: TypeUser.ADMIN });

		if (admins.length) {
			const adminParticipants = admins.map((admin) => ({
				chat_session_id,
				user_id: admin.id,
				type: TypeUser.ADMIN,
				joined_at: new Date(),
			}));

			await chatModel.createChatSessionParticipants(adminParticipants);
		}

		return {
			success: true,
			message: this.ResMsg.HTTP_OK,
			code: this.StatusCode.HTTP_OK,
			data: chat_session_id,
		};
	}
}
