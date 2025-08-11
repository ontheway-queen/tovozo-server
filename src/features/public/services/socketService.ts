import { io } from "../../../app/socket";
import {
	INotificationPayload,
	TypeEmitNotification,
	TypeEmitNotificationEnum,
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
		const {
			emitType,
			user_id,
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
		if (emitType === TypeEmitNotificationEnum.ADMIN_NEW_NOTIFICATION) {
			io.to(String(user_id)).emit(emitType as unknown as string, payload);
		}
	}
}

export default SocketService;
