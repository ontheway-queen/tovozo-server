export interface IGetJobResponse {
	id: number;
	title: string;
	details: string | null;
	status: boolean;
	is_deleted: boolean;
}
