import AbstractRouter from "../../../abstract/abstract.router";
import { JobSeekerJobsController } from "../controller/jobSeekerJobs.controller";

export class JobSeekerJobsRouter extends AbstractRouter {
    private controller = new JobSeekerJobsController();

    constructor(){
        super();
        this.callRouter();
    }

    private callRouter(){
        this.router.route("/").get(this.controller.getJobs)
    }
}