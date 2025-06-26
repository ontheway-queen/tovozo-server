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

export interface IRolePermission {
  permission_id: number;
  permission_name: string;
  read: boolean;
  write: boolean;
  update: boolean;
  delete: boolean;
}

export interface IGetSingleRole {
  role_id: number;
  role_name: string;
  status: string;
  is_main_role: boolean;
  permissions: IRolePermission[];
}

export interface IPermissionList {
  permission_id: number;
  permission_name: string;
  created_by: number;
  date: string | Date;
}
