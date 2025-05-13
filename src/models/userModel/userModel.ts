import { TDB } from '../../features/public/utils/types/publicCommon.types';
import Schema from '../../utils/miscellaneous/schema';
import {
  ICheckUserData,
  ICheckUserParams,
  ICreateUserPayload,
} from '../../utils/modelTypes/user/userModelTypes';

export default class UserModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async createUser(payload: ICreateUserPayload) {
    return await this.db(this.TABLES.user)
      .withSchema(this.DBO_SCHEMA)
      .insert(payload, 'id');
  }

  public async checkUser({
    email,
    id,
    username,
  }: ICheckUserParams): Promise<ICheckUserData> {
    return await this.db(this.TABLES.user)
      .withSchema(this.DBO_SCHEMA)
      .select('*')
      .where((qb) => {
        if (email) {
          qb.andWhere('email', email);
        }
        if (username) {
          qb.andWhere('username', username);
        }
        if (id) {
          qb.andWhere('id', id);
        }
      })
      .first();
  }
}
