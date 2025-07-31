import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import JobSeekerProfileService from "../service/jobSeekeerProfile.service";
import CustomError from "../../../utils/lib/customError";
import JobSeekerProfileUpdate from "../utils/validator/profile.validator";

export default class JobSeekerProfileController extends AbstractController {
	private profileService = new JobSeekerProfileService();
	private validator = new JobSeekerProfileUpdate();
	constructor() {
		super();
	}

	// get profile
	public getProfile = this.asyncWrapper.wrap(
		null,
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.profileService.getProfile(req);
			res.status(code).json(data);
		}
	);

	public updateProfile = this.asyncWrapper.wrap(
		{ bodySchema: this.validator.updateJobSeekerValidator },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.profileService.updateProfile(
				req
			);
			res.status(code).json(data);
		}
	);

	//change password
	public changePassword = this.asyncWrapper.wrap(
		{ bodySchema: this.commonValidator.changePassInputValidation },
		async (req: Request, res: Response) => {
			const { code, ...data } = await this.profileService.changePassword(
				req
			);
			res.status(code).json(data);
		}
	);
}
