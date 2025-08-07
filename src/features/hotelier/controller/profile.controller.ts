import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import HotelierProfileService from "../services/profile.service";
import HotelierProfileValidator from "../utils/validator/hotelierProfile.validator";

export default class HotelierProfileController extends AbstractController {
	private profileService = new HotelierProfileService();
	private hotelierProfileValidator = new HotelierProfileValidator();

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

	public updateHotelier = this.asyncWrapper.wrap(
		{ bodySchema: this.hotelierProfileValidator.updateProfile },
		async (req: Request, res: Response) => {
			console.log({ data: req.body });
			const { code, ...data } = await this.profileService.updateHotelier(
				req
			);
			res.status(code).json(data);
		}
	);
}
