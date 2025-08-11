import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import { JobSeekerChatService } from "../service/jobSeekerChat.service";
import ChatValidator from "../utils/validator/chat.validator";

export class JobSeekerChatController extends AbstractController {
	private service = new JobSeekerChatService();
	private validator = new ChatValidator();

	constructor() {
		super();
	}

	public getChatSessions = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getChatSessions(req);
			res.status(code).json(data);
		}
	);

	public getSingleHotelierChatSession = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...data } =
				await this.service.getSingleHotelierChatSession(req);
			res.status(code).json(data);
		}
	);

	public getMessages = this.asyncWrapper.wrap(
		{ querySchema: this.validator.getMessagesValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getMessages(req);
			res.status(code).json(data);
		}
	);

	public sendMessage = this.asyncWrapper.wrap(
		{ bodySchema: this.validator.sendMessageValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.sendMessage(req);
			res.status(code).json(data);
		}
	);

	public getSupportSession = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.service.getSupportSession(req);
			res.status(code).json(data);
		}
	);
}
