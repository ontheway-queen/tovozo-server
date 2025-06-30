import {
  IJobSeekerInfoBody,
  IJobSeekerNationalityBody,
  IJobSeekerUserBody,
} from "../../../auth/utils/types/jobSeekerAuth.types";

export interface IAdminJobSeekerUpdateParsedBody {
  user: IJobSeekerUserBody;
  jobSeeker: IJobSeekerNationalityBody;
  jobSeekerInfo: IJobSeekerInfoBody;
  ownAddress: any;
  addJobPreferences: number[];
  delJobPreferences: number[];
  addJobLocations: any[];
  delJobLocations: number[];
  updateJobLocations: any[];
  addJobShifting: string[];
  delJobShifting: string[];
}
