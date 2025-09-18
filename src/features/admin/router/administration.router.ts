import AbstractRouter from "../../../abstract/abstract.router";
import AdminAdministrationController from "../controller/administration.controller";

export default class AdminAdministrationRouter extends AbstractRouter {
	private controller = new AdminAdministrationController();

	constructor() {
		super();
		this.callRouter();
	}

	private callRouter() {
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
			.post(
				this.uploader.cloudUploadRaw(this.fileFolders.ADMIN_FILES),
				this.controller.createAdmin
			)
			.get(this.controller.getAllAdmin);

		//get single admin, update admin
		this.router
			.route("/admin/:id")
			.get(this.controller.getSingleAdmin)
			.patch(
				this.uploader.cloudUploadRaw(this.fileFolders.ADMIN_FILES),
				this.controller.updateAdmin
			);

		//get all audit trail
		this.router
			.route("/audit-trail")
			.get(this.controller.getAllAuditTrails);
	}
}
