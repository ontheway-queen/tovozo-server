export interface IInsertLastNoPayload {
  last_id: number;
  type: "Job";
  last_updated: Date;
}

export interface IUpdateLastNoPayload {
  last_id: number;
  last_updated: Date;
}

export interface IGetLastIdParams {
  type: "Job";
}

export interface IGetLastIdData {
  id: number;
  last_id: number;
}

export interface IJobSeeker {
  user_id: number;
  username: string;
  email: string;
  name: string;
  phone_number: string;
  photo: string;
  user_type: string;
  date_of_birth: string;
  gender: string;
  nationality: string;
  address: string;
  work_permit: boolean;
  account_status: string;
  criminal_convictions: boolean;
}

export interface IHotelier {
  user_id: number;
  username: string;
  email: string;
  name: string;
  phone_number: string;
  photo: string;
  organization_id: number;
  organization_name: string;
  address: string;
  organization_status: string;
}

export interface IAdmin {
  user_id: number;
  username: string;
  email: string;
  status: boolean;
  name: string;
  phone_number: string;
  photo: string;
  user_type: string;
  role_id: number;
  is_main: boolean;
  is_2fa_on: boolean;
}

export interface IForgetPasswordPayload {
  token: string;
  email: string;
  password: string;
}

export interface OTPType {
  type:
    | "reset_job_seeker"
    | "reset_admin"
    | "reset_hotelier"
    | "verify_job_seeker"
    | "verify_hotelier"
    | "verify_admin"
    | "verify_user"
    | "2fa_job_seeker"
    | "2fa_hotelier"
    | "2fa_admin";
}

export interface IChangePasswordPayload {
  old_password: string;
  new_password: string;
}
export interface IInsertOTPPayload extends OTPType {
  hashed_otp: string;
  email?: string;
}

export interface IGetOTPPayload extends OTPType {
  email: string;
}

export interface IMatchOTPPayload extends OTPType {
  email: string;
  otp: string;
}

export interface IGetOTP {
  id: number;
  hashed_otp: string;
  tried: number;
}

export interface ILocationPayload {
  city_id: number;
  name: string;
  address?: string;
  longitude?: number;
  latitude?: number;
  is_home_address?: boolean;
  postal_code?: string;
}

export interface ILocationUpdatePayload {
  id: number;
  city_id: number;
  name: string;
  address?: string;
  longitude?: number;
  latitude?: number;
  is_home_address?: boolean;
  postal_code?: string;
}
export enum NotificationTypeEnum {
  JOB_MATCH = "JOB_MATCH",
  REMINDER = "REMINDER",
  APPLICATION_UPDATE = "APPLICATION_UPDATE",
  PAYMENT = "PAYMENT",
  CANCELLATION = "CANCELLATION",
  JOB_SEEKER_VERIFICATION = "JOB_SEEKER_VERIFICATION",
  HOTELIER_VERIFICATION = "HOTELIER_VERIFICATION",
  SECURITY_ALERT = "SECURITY_ALERT",
  SYSTEM_UPDATE = "SYSTEM_UPDATE",
}

export interface INotificationPayload {
  user_id: number;
  content: string;
  type: `${NotificationTypeEnum}`;
  related_id: number;
}
export interface INotificationUserPayload {
  user_id: number;
  notification_id: number;
}

export interface IGetNotificationParams {
  id?: number;
  limit?: string;
  skip?: string;
  user_id: number;
  need_total?: boolean;
}

export interface IGetNotification {
  id: number;
  user_id: number;
  content: string;
  created_at: string;
  related_id: number | null;
  type: string;
  user_type: string;
  is_read: boolean;
}

export enum TypeEmitNotificationEnum {
  ADMIN_NEW_NOTIFICATION = "ADMIN_NEW_NOTIFICATION",
  HOTELIER_NEW_NOTIFICATION = "HOTELIER_NEW_NOTIFICATION",
  JOB_SEEKER_NEW_NOTIFICATION = "JOB_SEEKER_NEW_NOTIFICATION",
}

export type TypeEmitNotification = `${TypeEmitNotificationEnum}`;

export interface IGetAllStatesParams {
  country_id?: number;
  state_id?: number;
  limit?: number;
  skip?: number;
  filter?: string;
  name?: string;
}

export interface IGetState {
  id: number;
  name: string;
}
export interface IGetAllCityParams {
  country_id?: number;
  state_id?: number;
  city_id?: number;
  limit?: number;
  skip?: number;
  filter?: string;
  name?: string;
}

export interface IGetCity {
  id: number;
  name: string;
}
export interface IGetAllCountryParams {
  id?: number;
  name?: string;
  iso2?: string;
  iso3?: string;
}

export interface IGetCountry {
  id: number;
  name: string;
  iso2: string;
  iso3: string;
  phonecode: string;
  currency: string;
  currency_name: string;
  numeric_code: string;
}

export interface IGetNationality {
  name?: string;
  limit?: number;
  skip?: number;
}
