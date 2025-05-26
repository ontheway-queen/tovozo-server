

export interface ICreateOrganizationPayload {
  name: string;
  address: string;
  user_id: number;
  details?: string;
  status?: string;
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
