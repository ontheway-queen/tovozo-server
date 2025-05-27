import AbstractRouter from "../../../abstract/abstract.router";
import HotelierProfileController from "../controller/profile.controller";

export default class HotelierProfileRouter extends AbstractRouter {
  private controller = new HotelierProfileController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    // get profile
    this.router.route("/").get(this.controller.getProfile);

    // change password
    this.router.route("/change-password").post(this.controller.changePassword);
  }
}
