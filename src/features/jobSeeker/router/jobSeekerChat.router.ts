import AbstractRouter from "../../../abstract/abstract.router";
import { JobSeekerChatController } from "../controller/jobSeekerChat.controller";

export class JobSeekerChatRouter extends AbstractRouter {
	private controller = new JobSeekerChatController();

	constructor() {
		super();
		this.callRouter();
	}

	private callRouter() {
		this.router
			.route("/chat-sessions")
			.get(this.controller.getChatSessions);

		this.router
			.route("/chat-session/:hotelier_id")
			.get(this.controller.getSingleHotelierChatSession);

		this.router
			.route("/messages")
			.get(this.controller.getMessages)
			.post(this.controller.sendMessage);

		// For admin
		this.router.route("/support").get(this.controller.getSupportSession);
	}
}
