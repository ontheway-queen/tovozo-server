import { GenderType } from "../hotelier/jobPostModelTYpes";

export interface ICreateJobSeekerPayload {
  user_id: number;
  date_of_birth: string;
  gender: GenderType;
  nationality: string;
  address: string;
  work_permit: boolean;
  account_status?: string;
  criminal_convictions: boolean;
}

export interface IUpdateJobSeekerPayload
  extends Partial<ICreateJobSeekerPayload> {}

export interface IJobPreferencePayload {
  job_seeker_id: number;
  job_id: number;
}

export interface IJobLocationPayload {
  job_seeker_id: number;
  location_id: number;
}

export interface IJobShiftPayload {
  job_seeker_id: number;
  shift: string;
}

export interface IJobSeekerInfoPayload {
  job_seeker_id: number;
  hospitality_exp: boolean;
  languages: string;
  hospitality_certifications: string;
  medical_condition: string;
  dietary_restrictions: string;
  work_start: string;
  certifications: string;
  reference: string;
  resume: string;
  training_program_interested: boolean;
  start_working: string;
  hours_available: string;
  comment: string;
  passport_copy: string;
  visa_copy: string;
}
