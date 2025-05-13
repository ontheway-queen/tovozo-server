import { Knex } from 'knex';
import { db } from '../app/database';
import UserModel from './userModel/userModel';
import AdminModel from './adminModel/adminModel';

export default class Models {
  public UserModel(trx?: Knex.Transaction) {
    return new UserModel(trx || db);
  }
  public AdminModel(trx?: Knex.Transaction) {
    return new AdminModel(trx || db);
  }
}
