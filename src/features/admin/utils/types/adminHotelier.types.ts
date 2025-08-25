import {
	IHotelierUser,
	IOrganizationAddressPayload,
	IOrganizationAmenitiesType,
} from "../../../auth/utils/types/hotelierAuth.types";
import { UserStatusType } from "../../../public/utils/types/publicCommon.types";

export interface IHotelierUpdateParsedBody {
	organization: {
		org_name: string;
		status: UserStatusType;
	};
	user: Partial<IHotelierUser>;
	addPhoto: { file: string; organization_id: number }[];
	deletePhoto: string[];

	addAmenities: IOrganizationAmenitiesType[];
	updateAmenities: { amenity: string; id: number };
	deleteAmenities: number[];
	organization_address: Partial<IOrganizationAddressPayload> & {
		id?: number;
		city_id?: number;
	};
}
