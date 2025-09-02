import {
	IHotelierUser,
	IOrganizationAddressPayload,
} from "../../../auth/utils/types/hotelierAuth.types";
import { UserStatusType } from "../../../public/utils/types/publicCommon.types";

export interface IHotelierUpdateParsedBody {
	organization: {
		name: string | undefined;
		location_id: any;
		org_name: string;
		details?: string;
		status: UserStatusType;
		photo?: string;
	};
	user: Partial<IHotelierUser>;
	org_address: Partial<IOrganizationAddressPayload> & {
		id?: number;
		city_id?: number;
	};
}
