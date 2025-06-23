export interface JobApplication {
  id: number;
  job_post_details_id: number;
  job_seeker_id: number;
  status: 'approved' | 'cancelled' | 'hired' | 'rejected';
  created_at: string;
  is_deleted: boolean;
}


export interface ICreateJobApplicationPayload {
  job_post_details_id: number;
  job_seeker_id: number;
}