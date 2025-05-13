import { TDB } from '../../features/public/utils/types/publicCommon.types';
import Schema from '../../utils/miscellaneous/schema';
import {
  IGetLastIdData,
  IGetLastIdParams,
  IInsertLastNoPayload,
  IUpdateLastNoPayload,
} from '../../utils/modelTypes/common/commonModelTypes';

export default class CommonModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async insertLastNo(payload: IInsertLastNoPayload) {
    return await this.db(this.TABLES.last_no)
      .withSchema(this.DBO_SCHEMA)
      .insert(payload, 'id');
  }

  public async updateLastNo(payload: IUpdateLastNoPayload, id: number) {
    return await this.db(this.TABLES.last_no)
      .withSchema(this.DBO_SCHEMA)
      .update(payload)
      .where('id', id);
  }

  public async getLastId({
    type,
  }: IGetLastIdParams): Promise<IGetLastIdData | null> {
    return await this.db(this.TABLES.last_no)
      .withSchema(this.DBO_SCHEMA)
      .select('id', 'last_id')
      .where('type', type)
      .first();
  }
}
