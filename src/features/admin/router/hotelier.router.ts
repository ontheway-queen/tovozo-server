import AbstractRouter from "../../../abstract/abstract.router";
import AdminHotelierController from "../controller/hotelier.controller";

export default class AdminHotelierRouter extends AbstractRouter {
  private controller = new AdminHotelierController();

  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router
      .route("/")
      .post(
        this.uploader.cloudUploadRaw(this.fileFolders.HOTELIER_FILES),
        this.controller.createHotelier
      )
      .get(this.controller.getHoteliers);

    this.router
      .route("/:id")
      .get(this.controller.getSingleHotelier)
      .patch(
        this.uploader.cloudUploadRaw(this.fileFolders.HOTELIER_FILES),
        this.controller.updateHotelier
      )
      .delete(this.controller.deleteHotelier);
  }
}
