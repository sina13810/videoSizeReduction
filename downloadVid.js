import axios from "axios";
import { fileURLToPath } from "url";
import fs from "fs";
import { Worker, QueueEvents } from "bullmq";

let writable;

const myWorker = new Worker(
    "telegramBot_queue",
    async (job) => {
        if (job.name === "video_dwnld") {
            console.log(job.data.video_link);

            const config = {
                method: "GET",
                url: `${job.data.video_link}`,
                header: {
                    "cache-control": "no-cache",
                    // "Content-Type": "application/x-www-form-urlencoded",
                },
                responseType: "stream",
            };

            const response = await axios(config);

            writable = fs.createWriteStream("video.mp4");
            await response.data.pipe(writable);
        }
    },
    {
        connection: {
            host: "127.0.0.1",
            port: 6379,
        },
    }
);

// myWorker.on("completed", async (job) => {
//     console.log(`${job.id} has completed!`);
//     let iscomp = await job.isCompleted();
//     console.log(iscomp);

//     console.log(job.data);
// });

myWorker.on("failed", (job, err) => {
    console.log(`${job.id} has failed with ${err.message}`);
});
