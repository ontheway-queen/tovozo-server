import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import { HotelierChatService } from "../services/hotelierChat.service";
import HotelierChatValidator from "../utils/validator/hotelierChat.validator";

export class HotelierChatController extends AbstractController {
	private service = new HotelierChatService();
	private validator = new HotelierChatValidator();

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

	public getSingleJobSeekerChatSession = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...data } =
				await this.service.getSingleJobSeekerChatSession(req);
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
