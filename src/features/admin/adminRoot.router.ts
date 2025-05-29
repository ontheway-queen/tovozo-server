import { Router } from "express";
import AdminAdministrationRouter from "./router/administration.router";
import AdminProfileRouter from "./router/profile.router";

export default class AdminRootRouter {
  public Router = Router();
  private AdminAdministrationRouter = new AdminAdministrationRouter();
  private adminProfileRouter = new AdminProfileRouter();
  constructor() {
    this.callRouter();
  }

  private callRouter() {
    //administration
    this.Router.use("/administration", this.AdminAdministrationRouter.router);
    // profile router
    this.Router.use("/profile", this.adminProfileRouter.router);
  }
}
