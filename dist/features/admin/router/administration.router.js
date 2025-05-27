"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const administration_controller_1 = __importDefault(require("../controller/administration.controller"));
class AdminAdministrationRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new administration_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        //create role, view role
        this.router
            .route("/role")
            .post(this.controller.createRole)
            .get(this.controller.roleList);
        //create permission, view permission
        this.router
            .route("/permission")
            .post(this.controller.createPermission)
            .get(this.controller.permissionList);
        //get role permissions, update role permissions
        this.router
            .route("/role/:id")
            .get(this.controller.getSingleRolePermission)
            .patch(this.controller.updateRolePermissions);
        //create admin, view admin
        this.router
            .route("/admin")
            .post(this.uploader.cloudUploadRaw(this.fileFolders.ADMIN_FILES), this.controller.createAdmin)
            .get(this.controller.getAllAdmin);
        //get single admin, update admin
        this.router
            .route("/admin/:id")
            .get(this.controller.getSingleAdmin)
            .patch(this.uploader.cloudUploadRaw(this.fileFolders.ADMIN_FILES), this.controller.updateAdmin);
    }
}
exports.default = AdminAdministrationRouter;
