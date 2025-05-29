export interface ICreateAdminAuditTrailPayload {
  created_by: number;
  type: "GET" | "CREATE" | "UPDATE" | "DELETE";
  endpoint: string;
  details: string;
  payload?: string;
}

export interface ICreateAdmin {
  user_id: number;
  role_id: number;
  is_main?: boolean;
  created_by?: number;
  is_2fa_on?: boolean;
}
