export interface IRole {
  name: string;
  created_by?: number;
  agency_id?: number;
  is_main_role?: number;
}

export interface IPermission {
  name: string;
  created_by: number;
}

export interface IGetAdminListFilterQuery {
  filter?:string;
  role?:number;
  limit?:number;
  skip?:number;
  status?:string;
}

export interface IAdminSearchQuery {
  email?: string;
  id?: number;
  phone_number?: string;
  username?: string;
}