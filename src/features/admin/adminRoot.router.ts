import { Router } from "express";
import AdminChatRouter from "./router/adminChatRouter";
import AdminAdministrationRouter from "./router/administration.router";
import CancellationReportRouter from "./router/cancellationReport.router";
import AdminHotelierRouter from "./router/hotelier.router";
import AdminJobApplicationRouter from "./router/jobApplication.router";
import AdminJobPostRouter from "./router/jobPost.router";
import AdminJobRouter from "./router/jobs.router";
import AdminJobSeekerRouter from "./router/jobSeeker.router";
import AdminProfileRouter from "./router/profile.router";
import AdminReportRouter from "./router/report.router";

export default class AdminRootRouter {
  public Router = Router();
  private AdminAdministrationRouter = new AdminAdministrationRouter();
  private adminProfileRouter = new AdminProfileRouter();
  private adminJobRouter = new AdminJobRouter();
  private adminJobSeekerRouter = new AdminJobSeekerRouter();
  private adminHotelierRouter = new AdminHotelierRouter();
  private cancellationReportRouter = new CancellationReportRouter();
  private jobPostRouter = new AdminJobPostRouter();
  private reportRouter = new AdminReportRouter();
  private jobApplicationRouter = new AdminJobApplicationRouter();
  private adminChatRouter = new AdminChatRouter();

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

    // hotelier
    this.Router.use("/hotelier", this.adminHotelierRouter.router);

    // jobs
    this.Router.use("/jobs", this.jobPostRouter.router);

    // cancellation report
    this.Router.use(
      "/cancellation-report",
      this.cancellationReportRouter.router
    );

    // report
    this.Router.use("/reports", this.reportRouter.router);

    // job-application
    this.Router.use("/job-application", this.jobApplicationRouter.router);

    // chat
    this.Router.use("/chat", this.adminChatRouter.router);
  }
}
