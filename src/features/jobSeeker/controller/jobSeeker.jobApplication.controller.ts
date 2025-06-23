import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import { JobSeekerJobApplication } from "../service/jobSeeker.jobApplication.service";

export class JobSeekerJobApplicationController extends AbstractController {
    private service = new JobSeekerJobApplication();

    constructor(){
        super();
    }

    public createJobApplication = this.asyncWrapper.wrap(
        null,
        async(req: Request, res: Response) => {
            const { code, ...data } = await this.service.createJobApplication(req);
            res.status(code).json(data);
        }
    )
}