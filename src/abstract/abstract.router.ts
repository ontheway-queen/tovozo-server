import { Router } from "express";
import AuthChecker from "../middleware/authChecker/authChecker";
import Uploader from "../middleware/uploader/uploader";
import FileFolder from "../utils/miscellaneous/fileFolders";

export default class AbstractRouter {
  public router = Router();
  protected uploader = new Uploader();
  protected fileFolders = FileFolder;
  protected authChecker = new AuthChecker();
}
