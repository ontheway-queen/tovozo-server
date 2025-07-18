export enum TypeUser {
  ADMIN = "ADMIN",
  HOTELIER = "HOTELIER",
  JOB_SEEKER = "JOB_SEEKER",
}
export interface ICreateUserPayload {
  username?: string;
  name: string;
  email: string;
  password_hash: string;
  phone_number: string;
  photo: string;
  type: `${TypeUser}`;
  is_verified?: boolean;
}

export interface ICheckUserParams {
  id?: number;
  email?: string;
  username?: string;
  type?: string;
  phone_number?: string;
}

export interface ICheckUserData {
  id: number;
  username: string;
  name: string;
  email: string;
  password_hash: string;
  phone_number: string;
  photo: string | null;
  created_at: string;
  socket_id: string | null;
  type: `${TypeUser}`;
  status: boolean;
  is_deleted: boolean;
  location_id?: number;
}
