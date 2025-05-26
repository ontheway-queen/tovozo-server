import AbstractRouter from "../../../abstract/abstract.router";
import PublicController from "../controller/publicController";
class PublicRouter extends AbstractRouter {
  private Controller = new PublicController();

  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    // send email otp router
    this.router.post("/send-email-otp", this.Controller.sendEmailOtpController);

    //match otp email
    this.router.post(
      "/match-email-otp",
      this.Controller.matchEmailOtpController
    );
  }
}

export default PublicRouter;
