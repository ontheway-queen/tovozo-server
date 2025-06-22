import { GENDERS } from "../../miscellaneous/constants";

export type GenderType = (typeof GENDERS)[number];

export interface IJobPostPayload {
  id: number;
  organization_id: number;
  title: string;
  details?: string;
  created_time?: string;
  expire_time?: string;
  status?: string;
  hourly_rate: number;
  prefer_gender?: GenderType;
  requirements?: string;
}

export interface IJobPostDetailsPayload {
  id: number;
  job_post_id: number;
  job_id: number;
  start_time: string;
  end_time: string;
  status?: string;
}
