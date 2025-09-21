"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const hotelier_controller_1 = __importDefault(require("../controller/hotelier.controller"));
class AdminHotelierRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new hotelier_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route("/")
            .post(this.uploader.cloudUploadRaw(this.fileFolders.HOTELIER_FILES), this.controller.createHotelier)
            .get(this.controller.getHoteliers);
        this.router
            .route("/:id")
            .get(this.controller.getSingleHotelier)
            .patch(this.uploader.cloudUploadRaw(this.fileFolders.HOTELIER_FILES), this.controller.updateHotelier)
            .delete(this.controller.deleteHotelier);
    }
}
exports.default = AdminHotelierRouter;
