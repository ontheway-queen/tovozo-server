import { Router } from "express";
import AbstractRouter from "../../abstract/abstract.router";
import jobSeekerProfileRouter from "./router/jobSeekerProfile.router";
import { JobSeekerJobsRouter } from "./router/jobSeekerJobs.router";

export default class JobSeekerRootRouter extends AbstractRouter {
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    // profile router
    this.router.use("/profile", new jobSeekerProfileRouter().router);

    // job seeker jobs router
    this.router.use("/jobs", new JobSeekerJobsRouter().router);
  }
}
