import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";

class JobPostService extends AbstractServices {
  public async createJobPost(req: Request) {
    const body = req.body;
  }
}
export default JobPostService;
