import AbstractRouter from "../../../abstract/abstract.router";
import AdminProfileController from "../controller/profile.controller";

class AdminProfileRouter extends AbstractRouter {
  private controller = new AdminProfileController();

  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    //view profile, edit profile
    this.router
      .route("/")
      .get(this.controller.getProfile)
      .patch(
        this.uploader.cloudUploadRaw(this.fileFolders.ADMIN_FILES),
        this.controller.editProfile
      );

    //change password
    this.router.route("/change-password").post(this.controller.changePassword);
  }
}

export default AdminProfileRouter;
