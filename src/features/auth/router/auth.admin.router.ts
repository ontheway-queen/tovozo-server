import AbstractRouter from "../../../abstract/abstract.router";
import AdminAuthController from "../controller/auth.admin.controller";

export default class AdminAuthRouter extends AbstractRouter {
  private controller = new AdminAuthController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    //login
    this.router.route("/login").post(this.controller.login);

    this.router.route("/login-data").post(this.controller.loginData);

    //forget password
    this.router.route("/forget-password").post(this.controller.forgetPassword);
  }
}
