import { Knex } from "knex";
import { db } from "../app/database";
import UserModel from "./userModel/userModel";
import AdminModel from "./adminModel/adminModel";
import JobSeekerModel from "./jobSeekerModel/jobSeekerModel";
import CommonModel from "./commonModel/commonModel";
import OrganizationModel from "./hotelierModel/organizationModel";

export default class Models {
  public UserModel(trx?: Knex.Transaction) {
    return new UserModel(trx || db);
  }
  public AdminModel(trx?: Knex.Transaction) {
    return new AdminModel(trx || db);
  }

  // job seeker model
  public jobSeekerModel(trx?: Knex.Transaction) {
    return new JobSeekerModel(trx || db);
  }

  // common models
  public commonModel(trx?: Knex.Transaction) {
    return new CommonModel(trx || db);
  }

  // organization model
  public organizationModel(trx?: Knex.Transaction) {
    return new OrganizationModel(trx || db);
  }
}
