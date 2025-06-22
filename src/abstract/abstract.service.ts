import { Knex } from "knex";
import { db } from "../app/database";
import SocketService from "../features/public/services/socketService";
import Models from "../models/rootModel";
import ManageFile from "../utils/lib/manageFile";
import ResMsg from "../utils/miscellaneous/responseMessage";
import StatusCode from "../utils/miscellaneous/statusCode";
import { ICreateAdminAuditTrailPayload } from "../utils/modelTypes/admin/adminModelTypes";
import {
  INotificationPayload,
  TypeEmitNotification,
} from "../utils/modelTypes/common/commonModelTypes";
import { TypeUser } from "../utils/modelTypes/user/userModelTypes";

abstract class AbstractServices {
  protected db = db;
  protected manageFile = new ManageFile();
  protected ResMsg = ResMsg;
  private socketService = new SocketService();
  protected StatusCode = StatusCode;
  protected Model = new Models();

  protected async insertAdminAudit(
    trx: Knex.Transaction,
    payload: ICreateAdminAuditTrailPayload
  ) {
    const adminModel = this.Model.AdminModel(trx);

    await adminModel.createAudit(payload);
  }

  // Insert notification
  protected async insertNotification(
    trx: Knex.Transaction,
    userType: `${TypeUser}`,
    payload: INotificationPayload
  ) {
    const commonModel = this.Model.commonModel(trx);
    const notificationPayload: INotificationPayload[] = [];

    if (userType === TypeUser.ADMIN) {
      const adminModel = this.Model.AdminModel(trx);
      const getAllAdmin = await adminModel.getAllAdmin({});
      if (!getAllAdmin.data.length) {
        return;
      }
      for (const admin of getAllAdmin.data) {
        notificationPayload.push({
          user_id: admin.user_id,
          content: payload.content,
          related_id: payload.related_id,
          type: payload.type,
        });
        this.socketService.emitNotification({
          socket_id: admin.socket_id,
          user_id: admin.user_id,
          content: payload.content,
          related_id: payload.related_id,
          type: payload.type,
          emitType: TypeEmitNotification.ADMIN_NEW_NOTIFICATION,
        });
      }
      await commonModel.createNotification(notificationPayload);
    }
  }
}

export default AbstractServices;
