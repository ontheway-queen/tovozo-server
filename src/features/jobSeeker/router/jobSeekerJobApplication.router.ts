import AbstractRouter from "../../../abstract/abstract.router";
import { JobSeekerJobApplicationController } from "../controller/jobSeeker.jobApplication.controller";

export class JobSeekerJobApplicationRouter extends AbstractRouter {
    private controller = new JobSeekerJobApplicationController();

    constructor(){
        super();
        this.callRouter();
    }

    private callRouter(){
        this.router.route("/").post(this.controller.createJobApplication)
    }
}