import { Router } from 'express';
import FileFolder from '../utils/miscellaneous/fileFolders';
import Uploader from '../middleware/uploader/uploader';

export default class AbstractRouter {
  public router = Router();
  protected uploader = new Uploader();
  protected fileFolders = FileFolder;
}
