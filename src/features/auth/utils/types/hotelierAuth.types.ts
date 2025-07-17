import { TypeUser } from "../../../../utils/modelTypes/user/userModelTypes";
import { UserStatusType } from "../../../public/utils/types/publicCommon.types";

export type IOrganizationAmenitiesType = string;

export interface IOrganizationName {
  org_name: string;
}

export interface IHotelierUser {
  name: string;
  email: string;
  photo: string;
  password: string;
  phone_number: string;
  designation: string;
}

export interface IOrganizationAddressPayload {
  city_id: number;
  name: string;
  address?: string;
  longitude?: number;
  latitude?: number;
  is_home_address?: boolean;
  postal_code?: string;
}

export interface IHotelierRegistrationBodyPayload {
  user: IHotelierUser;
  organization: IOrganizationName;
  organization_address: IOrganizationAddressPayload;
  organization_amenities: IOrganizationAmenitiesType[];
}

export interface IHotelierAuthView {
  user_id: number;
  email: string;
  photo: string;
  password_hash: string;
  phone_number: string;
  designation: string;
  name: string;
  user_status: UserStatusType;
  user_deleted: boolean;
  user_type: TypeUser.HOTELIER;
  organization_id: number;
  organization_name: string;
  details?: string;
  organization_status: string;
  organization_deleted: boolean;
  organization_created_at: string;
  is_2fa_on: boolean;
  location_id?: number;
  city_id?: number;
  location_name?: string;
  address?: string;
  longitude?: string;
  latitude?: string;
  location_type?: string;
  postal_code?: string;
  location_status?: string;
  is_home_address?: boolean;
  location_created_at?: string;
  location_updated_at?: string;
}
