import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";

export class JobSeekerServices extends AbstractServices{
    constructor(){
        super();
    }

    public getJobs = async(req: Request) => {
        const { limit, skip } = req.query;
        const { user_id } = req.jobSeeker;
        console.log({user_id, limit, skip});
        const model = this.Model.jobPostModel();
        const {data, total} = await model.getJobPostList(req);
        return {
            success: true,
            message: this.ResMsg.HTTP_SUCCESSFUL,
            code: this.StatusCode.HTTP_SUCCESSFUL,
            data,
            total: total || 0,
        };
    }
}