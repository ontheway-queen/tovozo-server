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

    this.router.get("/notification", this.Controller.getAllNotification);

    //get country
    this.router.get("/country", this.Controller.getAllCountry);

    //get city
    this.router.get("/city", this.Controller.getAllCity);

    //get states
    this.router.get("/state", this.Controller.getAllStates);

    // nationality
    this.router.get("/nationality", this.Controller.getAllNationality);
  }
}

export default PublicRouter;
