import AbstractRouter from "../../../abstract/abstract.router";
import AdminChatController from "../controller/adminChatController";

class AdminChatRouter extends AbstractRouter {
	private controller = new AdminChatController();
	constructor() {
		super();
		this.callRouter();
	}
	private callRouter() {
		this.router
			.route("/chat-sessions")
			.get(this.controller.getChatSessions);

		this.router
			.route("/messages")
			.get(this.controller.getMessages)
			.post(this.controller.sendMessage);

		// this.router
		//   .route("/session")
		//   .post(this.controller.createChatSession)
		//   .get(this.controller.getChatSession);
		// this.router.route("/message").post(this.controller.createChatMessage);
		// this.router.route("/message/:id").get(this.controller.getChatMessages);
	}
}

export default AdminChatRouter;
