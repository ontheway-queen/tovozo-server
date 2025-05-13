import { Router } from 'express';
import AuthChecker from '../middleware/authChecker/authChecker';
import PublicRootRouter from '../features/public/publicRoot.router';
import AuthRootRouter from '../features/auth/authRoot.router';
import AdminRootRouter from '../features/admin/adminRoot.router';
import HotelierRootRouter from '../features/hotelier/hotelierRoot.router';
import JobSeekerRootRouter from '../features/jobSeeker/jobSeekerRoot.router';

export default class RootRouter {
  public v2Router = Router();
  private publicRootRouter = new PublicRootRouter();
  private authRootRouter = new AuthRootRouter();
  private adminRootRouter = new AdminRootRouter();
  private hotelierRootRouter = new HotelierRootRouter();
  private jobSeekerRootRouter = new JobSeekerRootRouter();

  // Auth checker
  private authChecker = new AuthChecker();
  constructor() {
    this.callV2Router();
  }

  private callV2Router() {
    // Public Routes
    this.v2Router.use('/public', this.publicRootRouter.router);

    // Auth Routes
    this.v2Router.use('/auth', this.authRootRouter.router);

    // Admin Routes
    this.v2Router.use(
      '/admin',
      this.authChecker.adminAuthChecker,
      this.adminRootRouter.router
    );

    // Job Seeker Routes
    this.v2Router.use(
      '/job-seeker',
      this.authChecker.adminAuthChecker,
      this.jobSeekerRootRouter.router
    );

    // Hotelier Routes
    this.v2Router.use(
      '/hotelier',
      this.authChecker.adminAuthChecker,
      this.hotelierRootRouter.router
    );
  }
}
