import { Router } from "express";
import AbstractRouter from "../../abstract/abstract.router";
import JobSeekerAuthRouter from "./router/auth.jobSeeker.router";

export default class AuthRootRouter extends AbstractRouter {
  private jobSeekerRouter = new JobSeekerAuthRouter();
  public AuthRouter = Router();
  constructor() {
    super();

    this.callRouter();
  }

  private callRouter() {
    //agent auth router
    this.AuthRouter.use("/job-seeker", this.jobSeekerRouter.router);
  }
}
