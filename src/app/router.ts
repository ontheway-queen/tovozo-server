import { Router } from "express";
import AdminRootRouter from "../features/admin/adminRoot.router";
import AuthRootRouter from "../features/auth/authRoot.router";
import HotelierRootRouter from "../features/hotelier/hotelierRoot.router";
import JobSeekerRootRouter from "../features/jobSeeker/jobSeekerRoot.router";
import PublicRouter from "../features/public/router/publicRouter";
import AuthChecker from "../middleware/authChecker/authChecker";

export default class RootRouter {
  public Router = Router();
  private publicRootRouter = new PublicRouter();
  private authRootRouter = new AuthRootRouter();
  private adminRootRouter = new AdminRootRouter();
  private hotelierRootRouter = new HotelierRootRouter();
  private jobSeekerRootRouter = new JobSeekerRootRouter();

  // Auth checker
  private authChecker = new AuthChecker();
  constructor() {
    this.callRouter();
  }

  private callRouter() {
    // Public Routes
    this.Router.use("/public", this.publicRootRouter.router);

    // Auth Routes
    this.Router.use("/auth", this.authRootRouter.AuthRouter);

    // Admin Routes
    this.Router.use(
      "/admin",
      this.authChecker.adminAuthChecker,
      this.adminRootRouter.Router
    );

    // Job Seeker Routes
    this.Router.use(
      "/job-seeker",
      this.authChecker.jobSeekerAuthChecker,
      this.jobSeekerRootRouter.router
    );

    // Hotelier Routes
    this.Router.use(
      "/hotelier",
      this.authChecker.hotelierAuthChecker,
      this.hotelierRootRouter.router
    );
  }
}
