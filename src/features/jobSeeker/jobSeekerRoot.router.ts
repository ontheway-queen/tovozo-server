import { Router } from "express";
import AbstractRouter from "../../abstract/abstract.router";
import jobSeekerProfileRouter from "./router/jobSeekerProfile.router";

export default class JobSeekerRootRouter extends AbstractRouter {
  public router = Router();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    // profile router
    this.router.use("/profile", new jobSeekerProfileRouter().router);
  }
}
