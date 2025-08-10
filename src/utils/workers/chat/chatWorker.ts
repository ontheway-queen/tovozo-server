import { db } from "../../../app/database";
import { getAllOnlineSocketIds, io } from "../../../app/socket";
import Models from "../../../models/rootModel";
import Lib from "../../lib/lib";
import {
	NotificationTypeEnum,
	TypeEmitNotificationEnum,
} from "../../modelTypes/common/commonModelTypes";
import { TypeUser } from "../../modelTypes/user/userModelTypes";

export default class ChatWorker {
	public async createChatSession(job: any) {
		const { hotelier_id, job_seeker_id } = job.data;
		return await db.transaction(async (trx) => {
			const chatModel = new Models().chatModel(trx);
			const existingSession =
				await chatModel.checkSessionForJobSeekerAndHotelier({
					hotelier_id,
					job_seeker_id,
				});
			if (existingSession) {
				console.log("Chat session already exists.");
				await chatModel.updateChatSession({
					session_id: existingSession.id,
					payload: {
						last_message:
							"Welcome back! You can continue your conversation here.",
						last_message_at: new Date(),
						enable_chat: true,
					},
				});
				return;
			}
			const [session] = await chatModel.createChatSession({
				last_message:
					"Hi there! Feel free to start the conversation here.",
			});

			const chatSessionParticipants = [
				{
					chat_session_id: session.id,
					user_id: hotelier_id,
					type: TypeUser.HOTELIER,
					joined_at: new Date(),
				},
				{
					chat_session_id: session.id,
					user_id: job_seeker_id,
					type: TypeUser.JOB_SEEKER,
					joined_at: new Date(),
				},
			];

			await chatModel.createChatSessionParticipants(
				chatSessionParticipants
			);

			const messagePayload = {
				chat_session_id: session.id,
				sender_id: hotelier_id,
				message: "Hi there! Feel free to start the conversation here.",
			};

			await chatModel.sendMessage(messagePayload);

			const isJobSeekerOnline = await getAllOnlineSocketIds({
				user_id: job_seeker_id,
				type: TypeUser.JOB_SEEKER,
			});

			if (isJobSeekerOnline && isJobSeekerOnline.length > 0) {
				io.to(String(job_seeker_id)).emit(
					TypeEmitNotificationEnum.JOB_SEEKER_NEW_NOTIFICATION,
					{
						user_id: job_seeker_id,
						type: NotificationTypeEnum.JOB_TASK,
						title: "New Message",
						content:
							"Hi there! Feel free to start the conversation here.",
						read_status: false,
						created_at: new Date().toISOString(),
					}
				);
			} else {
				const userModel = new Models().UserModel(trx);
				const checkUser = await userModel.checkUser({
					id: job_seeker_id,
				});
				if (checkUser && checkUser[0].device_id) {
					await Lib.sendNotificationToMobile({
						to: checkUser[0].device_id,
						notificationTitle: "New Message",
						notificationBody:
							"Hi there! Feel free to start the conversation here.",
						// data: JSON.stringify({
						// 	photo,
						// 	related_id,
						// }),
					});
				}
			}

			console.log(5);
			console.log("Chat session created successfully.");
		});
	}
}
