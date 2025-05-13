import {} from '';
import { Knex } from 'knex';
import {
  ITokenParseAdmin,
  ITokenParseHotelier,
  ITokenParseJobSeeker,
} from './src/features/public/utils/types/publicCommon.types';
declare global {
  namespace Express {
    interface Request {
      hotelier: ITokenParseHotelier;
      jobSeeker: ITokenParseJobSeeker;
      admin: ITokenParseAdmin;
      upFiles: string[];
    }
  }
}
