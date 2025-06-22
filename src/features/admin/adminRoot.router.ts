import { Router } from "express";
import AdminAdministrationRouter from "./router/administration.router";
import AdminJobRouter from "./router/jobs.router";
import AdminJobSeekerRouter from "./router/jobSeeker.router";
import AdminProfileRouter from "./router/profile.router";

export default class AdminRootRouter {
  public Router = Router();
  private AdminAdministrationRouter = new AdminAdministrationRouter();
  private adminProfileRouter = new AdminProfileRouter();
  private adminJobRouter = new AdminJobRouter();
  private adminJobSeekerRouter = new AdminJobSeekerRouter();
  constructor() {
    this.callRouter();
  }

  private callRouter() {
    //administration
    this.Router.use("/administration", this.AdminAdministrationRouter.router);
    // profile router
    this.Router.use("/profile", this.adminProfileRouter.router);
    // job router
    this.Router.use("/job-category", this.adminJobRouter.router);
    // Job seeker
    this.Router.use("/job-seeker", this.adminJobSeekerRouter.router);
  }
}
