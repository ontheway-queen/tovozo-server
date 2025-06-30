import { io } from "../../../app/socket";
import {
  INotificationPayload,
  TypeEmitNotification,
} from "../../../utils/modelTypes/common/commonModelTypes";

class SocketService {
  public emitNotification(
    data: INotificationPayload & {
      socketId: string;
      read_status?: boolean;
      created_at?: string;
      emitType: TypeEmitNotification;
    }
  ) {
    console.log("Emitting notification to socket:", data);
    const {
      emitType,
      read_status = false,
      created_at = new Date().toISOString(),
      socketId,
      ...restData
    } = data;

    const payload = {
      ...restData,
      read_status,
      created_at,
    };

    io.to(socketId).emit(emitType as unknown as string, payload);
  }
}

export default SocketService;
