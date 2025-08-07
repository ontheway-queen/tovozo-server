import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import { io } from "../../../app/socket";
import CustomError from "../../../utils/lib/customError";
import { TypeUser } from "../../../utils/modelTypes/user/userModelTypes";

export class HotelierChatService extends AbstractServices {
	constructor() {
		super();
	}

	public async getChatSessions(req: Request) {
		const { user_id } = req.hotelier;
		const chatModel = this.Model.chatModel();
		const data = await chatModel.getChatSessions({ user_id });

		return {
			success: true,
			message: this.ResMsg.HTTP_OK,
			code: this.StatusCode.HTTP_OK,
			data,
		};
	}

	public async getMessages(req: Request) {
		const { user_id } = req.hotelier;
		const session_id = Number(req.query.session_id);
		const chatModel = this.Model.chatModel();
		const data = await chatModel.getMessages({
			chat_session_id: session_id,
			user_id,
		});

		return {
			success: true,
			message: this.ResMsg.HTTP_OK,
			code: this.StatusCode.HTTP_OK,
			data,
		};
	}

	public async sendMessage(req: Request) {
		const { user_id } = req.hotelier;
		const { message, chat_session_id } = req.body;

		return await this.db.transaction(async (trx) => {
			const chatModel = this.Model.chatModel(trx);
			const messagePayload = {
				sender_id: user_id,
				message,
				chat_session_id,
			};

			const newMessage = await chatModel.sendMessage(messagePayload);

			await chatModel.updateChatSession({
				last_message: message,
				session_id: chat_session_id,
			});

			await chatModel.updateChatSession({
				last_message: message,
				session_id: chat_session_id,
			});

			io.to(`chat:${chat_session_id}`).emit("chat:receive", {
				id: newMessage[0].id,
				chat_session_id,
				sender_id: user_id,
				message,
				created_at: newMessage[0].created_at,
				photo: "",
				content: message,
				read_status: false,
			});

			return {
				success: true,
				message: this.ResMsg.HTTP_OK,
				code: this.StatusCode.HTTP_OK,
			};
		});
	}

	public async getSupportSession(req: Request) {
		const userModel = this.Model.UserModel();
		const chatModel = this.Model.chatModel();
		const { user_id } = req.hotelier;

		const checkUser = await userModel.checkUser({ id: user_id });
		if (checkUser && checkUser.length < 1) {
			throw new CustomError(
				"User not found!",
				this.StatusCode.HTTP_NOT_FOUND
			);
		}

		let chatSession = await chatModel.checkSupportSession(user_id);
		if (chatSession) {
			const chat_session_id = chatSession.id;

			const existingParticipants = await chatModel.getSessionParticipants(
				chat_session_id
			);

			const existingAdminIds = new Set(
				existingParticipants
					.filter((p) => p.type === TypeUser.ADMIN)
					.map((p) => p.user_id)
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
				type: TypeUser.HOTELIER,
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
