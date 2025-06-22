import { io } from "../../../app/socket";
import {
  INotificationPayload,
  TypeEmitNotification,
} from "../../../utils/modelTypes/common/commonModelTypes";

class SocketService {
  public emitNotification(
    data: INotificationPayload & {
      socket_id: string;
      read_status?: boolean;
      created_at?: string;
      emitType: TypeEmitNotification;
    }
  ) {
    const {
      emitType,
      read_status = false,
      created_at = new Date().toISOString(),
      socket_id,
      ...restData
    } = data;

    const payload = {
      ...restData,
      read_status,
      created_at,
    };

    io.to(socket_id).emit(emitType as unknown as string, payload);
  }
}

export default SocketService;
