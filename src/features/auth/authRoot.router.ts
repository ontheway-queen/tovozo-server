import { Router } from "express";
import AbstractRouter from "../../abstract/abstract.router";
import JobSeekerAuthRouter from "./router/auth.jobSeeker.router";
import HotelierAuthRouter from "./router/auth.hotelier.router";
import AdminAuthRouter from "./router/auth.admin.router";

export default class AuthRootRouter {
  private jobSeekerRouter = new JobSeekerAuthRouter();
  private hotelierAuthRouter = new HotelierAuthRouter();
  private adminAuthRouter = new AdminAuthRouter();
  public AuthRouter = Router();
  constructor() {
    this.callRouter();
  }

  private callRouter() {
    // auth routes for job seeker, hotelier, and admin
    this.AuthRouter.use("/job-seeker", this.jobSeekerRouter.router);
    this.AuthRouter.use("/hotelier", this.hotelierAuthRouter.router);
    this.AuthRouter.use("/admin", this.adminAuthRouter.router);
  }
}
