import { Router } from "express";
import AbstractRouter from "../../abstract/abstract.router";
import JobSeekerAuthRouter from "./router/auth.jobSeeker.router";
import HotelierAuthRouter from "./router/auth.hotelier.router";

export default class AuthRootRouter {
  private jobSeekerRouter = new JobSeekerAuthRouter();
  private hotelierAuthRouter = new HotelierAuthRouter();
  public AuthRouter = Router();
  constructor() {
    this.callRouter();
  }

  private callRouter() {
    //agent auth router
    this.AuthRouter.use("/job-seeker", this.jobSeekerRouter.router);
    this.AuthRouter.use("/hotelier", this.hotelierAuthRouter.router);
  }
}
