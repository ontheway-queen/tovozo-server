"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class NotificationMessage {
}
NotificationMessage.JOB_ASSIGNED = {
    title: "New Job Assigned",
    content: ({ id, jobTitle }) => `You have been assigned to the job ID: ${id} and Title: "${jobTitle}". Please review the requirements carefully.`,
};
NotificationMessage.NEW_TASKS_ASSIGNED = {
    title: "New Tasks Assigned",
    content: (applicationId) => applicationId
        ? `New tasks have been assigned to you for application #${applicationId}. Please check the job details.`
        : `New tasks have been assigned to you. Please check the job details.`,
};
NotificationMessage.WAITING_FOR_APPROVAL = {
    title: "Job Task Awaiting Your Approval",
    content: ({ id, jobTitle }) => `The job "${jobTitle}" (ID: #${id}) is waiting for your approval.`,
};
NotificationMessage.TASK_STATUS = {
    title: (completed) => completed ? "Task Completed" : "Task Incomplete",
    content: (taskId, completed) => `The task #${taskId} has been ${completed ? "marked as incomplete" : "completed"}.`,
};
NotificationMessage.TASK_UNDER_REVIEW = {
    title: "Task Under Review",
    content: (taskId) => `Your task #${taskId} is currently under review. Please wait a few moments.`,
};
NotificationMessage.NEW_JOB_POST_NEARBY = {
    title: "New Job Post Near You",
    content: "A new job post matching your location is now available. Check it out and apply soon!",
};
NotificationMessage.NEW_JOB_SEEKER_REGISTRATION = {
    title: "New Job Seeker Registration",
    content: (name) => `New job seeker "${name}" has registered and is awaiting verification. Please review their details to approve their account.`,
};
NotificationMessage.NEW_HOTELIER_REGISTRATION = {
    title: "New Hotelier Registration",
    content: (name) => `New hotelier "${name}" has registered and is awaiting verification. Please review their details to approve their account.`,
};
NotificationMessage.JOB_SEEKER_ACCOUNT_CREATED = {
    title: "Job Seeker Account Created",
    content: (name) => `Job seeker "${name}" has successfully created an account and is ready for verification.`,
};
NotificationMessage.JOB_APPLICATION_RECEIVED = {
    title: "New Job Application Received",
    content: ({ jobTitle, jobPostId, }) => `A job seeker has applied for your job post "${jobTitle}" (ID: #${jobPostId}). Please review the application details.`,
};
NotificationMessage.JOB_START_REMINDER = {
    title: "Your Job Starts Soon",
    content: ({ jobTitle, startTime, }) => `Reminder: Your job "${jobTitle}" is starting at ${startTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    })}. Please be prepared and arrive on time.`,
};
NotificationMessage.TASK_SUBMITTED_FOR_FINAL_APPROVAL = {
    title: "Task Submitted for Your Approval",
    content: ({ id, jobTitle }) => `The task for "${jobTitle}" (ID: #${id}) has been submitted by the job seeker. Please review and approve it to proceed with payment.`,
};
NotificationMessage.PAYMENT_RECEIVED = {
    title: "Payment Received",
    content: ({ jobTitle, amount, }) => `You have received a payment of $${amount} for the job "${jobTitle}". The amount will be available in your bank account very soon.`,
};
exports.default = NotificationMessage;
