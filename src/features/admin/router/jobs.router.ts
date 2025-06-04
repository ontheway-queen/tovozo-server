import AbstractRouter from "../../../abstract/abstract.router";
import AdminJobController from "../controller/jobs.controller";

class AdminJobRouter extends AbstractRouter {
  private controller = new AdminJobController();

  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router
      .route("/")
      .get(this.controller.getAllJob)
      .post(this.controller.createJob);

    this.router
      .route("/:id")
      .patch(this.controller.updateJob)
      .delete(this.controller.deleteJob);
  }
}

export default AdminJobRouter;
