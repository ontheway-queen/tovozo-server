import AbstractRouter from "../../../abstract/abstract.router";
import { HotelierChatController } from "../controller/hotelierChat.controller";

export class HotelierChatRouter extends AbstractRouter {
	private controller = new HotelierChatController();

	constructor() {
		super();
		this.callRouter();
	}

	private callRouter() {
		this.router
			.route("/chat-sessions")
			.get(this.controller.getChatSessions);

		this.router
			.route("/chat-session/:job_seeker_id")
			.get(this.controller.getSingleJobSeekerChatSession);

		this.router
			.route("/messages")
			.get(this.controller.getMessages)
			.post(this.controller.sendMessage);

		// For admin support
		this.router.route("/support").get(this.controller.getSupportSession);
	}
}
