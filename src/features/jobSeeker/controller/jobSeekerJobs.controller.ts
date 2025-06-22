import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import { JobSeekerServices } from "../service/jobSeekerJobs.service";

export class JobSeekerJobsController extends AbstractController {
    private service = new JobSeekerServices();
    constructor(){
        super();
    }

    public getJobs = this.asyncWrapper.wrap(
        {querySchema: this.commonValidator.getLimitSkipQueryValidator},
        async(req: Request, res: Response) => {
            console.log({data: req});
            const { code, ...data } = await this.service.getJobs(req);
            res.status(code).json(data);
        }
    )
}