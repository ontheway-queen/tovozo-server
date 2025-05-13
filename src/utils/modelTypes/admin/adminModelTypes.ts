export interface ICreateAdminAuditTrailPayload {
  created_by: number;
  type: 'GET' | 'CREATE' | 'UPDATE' | 'DELETE';
  endpoint: string;
  details: string;
  payload?: string;
}
