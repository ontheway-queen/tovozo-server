import { UserStatusType } from "../../../features/public/utils/types/publicCommon.types";

export interface ICreateOrganizationPayload {
  name: string;
  user_id: number;
  details?: string;
  status?: string;
  location_id: number;
  is_deleted?: boolean;
}

export interface IUpdateOrganizationPayload {
  name?: string;
  address?: string;
  details?: string;
  status?: string;
  is_deleted?: boolean;
}

export interface ICreatePhotoPayload {
  organization_id: number;
  file: string;
  is_deleted?: boolean;
}

export interface ICreateAmenityPayload {
  organization_id: number;
  amenity: string;
}

export interface IGetOrganization {
  id: number;
  name?: string;
  user_id: number;
  details?: string;
  created_at?: string;
  status: UserStatusType;
  is_deleted: boolean;
  is_2fa_on?: boolean;
  location_id?: number;
  user_email?: string;
  user_phone_number?: string;
  user_name?: string;
  user_photo?: string;
  location_name?: string;
  location_address?: string;
  city_name?: string;
  state_name?: string;
  country_name?: string;
  longitude?: string;
  latitude?: string;
}
