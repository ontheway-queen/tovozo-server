import { Request, Response } from "express";
import Joi from "joi";
import AbstractController from "../../../abstract/abstract.controller";
import AdminChatService from "../services/adminChatService";
import AdminChatValidator from "../utils/validator/adminChat.validator";

class AdminChatController extends AbstractController {
	private services = new AdminChatService();
	private validator = new AdminChatValidator();
	constructor() {
		super();
	}

	public getChatSessions = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.services.getChatSessions(req);
			res.status(code).json(data);
		}
	);

	public getMessages = this.asyncWrapper.wrap(
		{ querySchema: this.validator.getMessagesValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.services.getMessages(req);
			res.status(code).json(data);
		}
	);

	public sendMessage = this.asyncWrapper.wrap(
		{ bodySchema: this.validator.sendMessageValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.services.sendMessage(req);
			res.status(code).json(data);
		}
	);
}

export default AdminChatController;
