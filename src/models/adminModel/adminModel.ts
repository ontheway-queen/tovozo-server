import { TDB } from '../../features/public/utils/types/publicCommon.types';
import Schema from '../../utils/miscellaneous/schema';
import { ICreateAdminAuditTrailPayload } from '../../utils/modelTypes/admin/adminModelTypes';

export default class AdminModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }
  //create audit
  public async createAudit(payload: ICreateAdminAuditTrailPayload) {
    return await this.db(this.TABLES.audit_trail)
      .withSchema(this.ADMIN_SCHEMA)
      .insert(payload);
  }
}
