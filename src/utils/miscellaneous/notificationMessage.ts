class NotificationMessage {
	static readonly JOB_ASSIGNED = {
		title: "New Job Assigned",
		content: ({ id, jobTitle }: { id?: number; jobTitle?: string }) =>
			`You have been assigned to the job ID: ${id} and Title: "${jobTitle}". Please review the requirements carefully.`,
	};

	static readonly NEW_TASKS_ASSIGNED = {
		title: "New Tasks Assigned",
		content: (applicationId?: number) =>
			applicationId
				? `New tasks have been assigned to you for application #${applicationId}. Please check the job details.`
				: `New tasks have been assigned to you. Please check the job details.`,
	};

	static readonly WAITING_FOR_APPROVAL = {
		title: "Job Task Awaiting Your Approval",
		content: ({ id, jobTitle }: { id?: number; jobTitle?: string }) =>
			`The job "${jobTitle}" (ID: #${id}) is waiting for your approval.`,
	};

	static readonly TASK_STATUS = {
		title: (completed: boolean) =>
			completed ? "Task Completed" : "Task Incomplete",
		content: (taskId: number, completed: boolean) =>
			`The task #${taskId} has been ${
				completed ? "marked as incomplete" : "completed"
			}.`,
	};

	static readonly TASK_UNDER_REVIEW = {
		title: "Task Under Review",
		content: (taskId: number) =>
			`Your task #${taskId} is currently under review. Please wait a few moments.`,
	};

	static readonly NEW_JOB_POST_NEARBY = {
		title: "New Job Post Near You",
		content:
			"A new job post matching your location is now available. Check it out and apply soon!",
	};

	static readonly NEW_JOB_SEEKER_REGISTRATION = {
		title: "New Job Seeker Registration",
		content: (name: string) =>
			`New job seeker "${name}" has registered and is awaiting verification. Please review their details to approve their account.`,
	};

	static readonly NEW_HOTELIER_REGISTRATION = {
		title: "New Hotelier Registration",
		content: (name: string) =>
			`New hotelier "${name}" has registered and is awaiting verification. Please review their details to approve their account.`,
	};

	static readonly JOB_SEEKER_ACCOUNT_CREATED = {
		title: "Job Seeker Account Created",
		content: (name: string) =>
			`Job seeker "${name}" has successfully created an account and is ready for verification.`,
	};

	static readonly JOB_APPLICATION_RECEIVED = {
		title: "New Job Application Received",
		content: ({
			jobTitle,
			jobPostId,
		}: {
			jobTitle?: string;
			jobPostId?: number;
		}) =>
			`A job seeker has applied for your job post "${jobTitle}" (ID: #${jobPostId}). Please review the application details.`,
	};

	static readonly JOB_START_REMINDER = {
		title: "Your Job Starts Soon",
		content: ({
			jobTitle,
			startTime,
		}: {
			jobTitle: string;
			startTime: Date;
		}) =>
			`Reminder: Your job "${jobTitle}" is starting at ${startTime.toLocaleTimeString(
				[],
				{
					hour: "2-digit",
					minute: "2-digit",
				}
			)}. Please be prepared and arrive on time.`,
	};

	static readonly TASK_SUBMITTED_FOR_FINAL_APPROVAL = {
		title: "Task Submitted for Your Approval",
		content: ({ id, jobTitle }: { id?: number; jobTitle?: string }) =>
			`The task for "${jobTitle}" (ID: #${id}) has been submitted by the job seeker. Please review and approve it to proceed with payment.`,
	};
}

export default NotificationMessage;
