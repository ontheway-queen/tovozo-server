import { Router } from "express";
import AdminAdministrationRouter from "./router/administration.router";

export default class AdminRootRouter  {
  public Router = Router();
  private AdminAdministrationRouter = new AdminAdministrationRouter();
  constructor() {
   

    this.callRouter();
  }

  private callRouter() {
    //administration
    this.Router.use("/administration", this.AdminAdministrationRouter.router);
  }
}
