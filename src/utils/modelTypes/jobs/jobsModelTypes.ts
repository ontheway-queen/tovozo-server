export interface ICreateJobPayload {
  title: string;
  details?: string;
}

export interface IJobGetParam {
  title?: string;
  filter?: string;
  orderBy?: "title";
  orderTo?: "asc" | "desc";
  status?: boolean;
  limit?: string;
  skip?: string;
}

export interface IJobUpdatePayload {
  title?: string;
  details?: string;
  status?: boolean;
}

export interface IGetJobResponse {
  id: number;
  title: string;
  details: string;
  status: boolean;
}
