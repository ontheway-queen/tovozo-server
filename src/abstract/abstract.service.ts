import { Knex } from "knex";
import { db } from "../app/database";
import { getAllOnlineSocketIds } from "../app/socket";
import SocketService from "../features/public/services/socketService";
import Models from "../models/rootModel";
import ManageFile from "../utils/lib/manageFile";
import ResMsg from "../utils/miscellaneous/responseMessage";
import StatusCode from "../utils/miscellaneous/statusCode";
import { ICreateAdminAuditTrailPayload } from "../utils/modelTypes/admin/adminModelTypes";
import {
  INotificationPayload,
  TypeEmitNotificationEnum,
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
      const getAllAdmin = await this.Model.AdminModel(trx).getAllAdmin(
        {},
        false
      );
      if (!getAllAdmin.data.length) {
        for (const admin of getAllAdmin.data) {
          notificationPayload.push({
            user_id: admin.user_id,
            content: payload.content,
            related_id: payload.related_id,
            type: payload.type,
          });
        }
      }
      const getAllAdminSocketIds = await getAllOnlineSocketIds({
        type: userType,
      });
      if (!getAllAdminSocketIds.length) return;
      const seenUserIds = new Set<number>();
      for (const { user_id, socketId } of getAllAdminSocketIds) {
        if (seenUserIds.has(user_id)) {
          this.socketService.emitNotification({
            user_id,
            socketId,
            content: payload.content,
            related_id: payload.related_id,
            type: payload.type,
            emitType: TypeEmitNotificationEnum.ADMIN_NEW_NOTIFICATION,
          });
          continue;
        }
        seenUserIds.add(user_id);
      }
    } else {
      const getAllUsers = await this.Model.UserModel(trx).checkUser({
        type: userType,
      });
      if (!getAllUsers.length) {
        for (const user of getAllUsers) {
          notificationPayload.push({
            user_id: user.id,
            content: payload.content,
            related_id: payload.related_id,
            type: payload.type,
          });
        }
      }
      const getUserSocketIds = await getAllOnlineSocketIds({ type: userType });
      if (!getUserSocketIds.length) return;

      for (const { user_id, socketId } of getUserSocketIds) {
        this.socketService.emitNotification({
          user_id,
          socketId,
          content: payload.content,
          related_id: payload.related_id,
          type: payload.type,
          emitType:
            userType === TypeUser.HOTELIER
              ? TypeEmitNotificationEnum.HOTELIER_NEW_NOTIFICATION
              : TypeEmitNotificationEnum.JOB_SEEKER_NEW_NOTIFICATION,
        });
      }
    }

    if (!notificationPayload.length) return;
    await commonModel.createNotification(notificationPayload);
  }
}

export default AbstractServices;
