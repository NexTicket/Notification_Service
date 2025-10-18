import { notificationQueue } from "./notificationQueue";
import { sendEmail } from "../services/sendGridService";

notificationQueue.process(async(job) => {
    if(job.data.type === "EMAIL") {
        await sendEmail({
            recipient: "deepthi.lap@gmail.com",
            subject: job.data.subject || "",
            content: job.data.content || "",
            textContent: job.data.content || "",
            metadata: job.data.variables ?? {},
        });
    }
})