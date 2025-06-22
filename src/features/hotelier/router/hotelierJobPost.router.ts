import AbstractRouter from "../../../abstract/abstract.router";
import HotelierJobPostController from "../controller/hotelierJobPost.controller";

export default class HotelierJobPostRouter extends AbstractRouter {
  private controller = new HotelierJobPostController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router.route("/").post(this.controller.createJobPost);
  }
}
