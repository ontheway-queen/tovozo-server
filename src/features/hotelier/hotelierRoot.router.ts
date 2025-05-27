import AbstractRouter from "../../abstract/abstract.router";
import HotelierProfileRouter from "./router/profile.router";

export default class HotelierRootRouter extends AbstractRouter {
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    // profile router
    this.router.use("/profile", new HotelierProfileRouter().router);
  }
}
