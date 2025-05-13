export interface IInsertLastNoPayload {
  last_id: number;
  type: 'Job';
  last_updated: Date;
}

export interface IUpdateLastNoPayload {
  last_id: number;
  last_updated: Date;
}

export interface IGetLastIdParams {
  type: 'Job';
}

export interface IGetLastIdData {
  id: number;
  last_id: number;
}
