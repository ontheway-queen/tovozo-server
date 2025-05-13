import { Knex } from 'knex';
import { db } from '../app/database';
import Models from '../models/rootModel';
import ManageFile from '../utils/lib/manageFile';
import ResMsg from '../utils/miscellaneous/responseMessage';
import StatusCode from '../utils/miscellaneous/statusCode';
import { ICreateAdminAuditTrailPayload } from '../utils/modelTypes/admin/adminModelTypes';

abstract class AbstractServices {
  protected db = db;
  protected manageFile = new ManageFile();
  protected ResMsg = ResMsg;
  protected StatusCode = StatusCode;
  protected Model = new Models();

  protected async insertAdminAudit(
    trx: Knex.Transaction,
    payload: ICreateAdminAuditTrailPayload
  ) {
    const adminModel = this.Model.AdminModel(trx);

    await adminModel.createAudit(payload);
  }
}

export default AbstractServices;
