import axios from "axios";
import { fileURLToPath } from "url";
import fs from "fs";
import { Worker, Queue } from "bullmq";
import { exec } from "child_process";
import path from "path";
import { queue } from "sharp";

var __dirname = path.dirname(fileURLToPath(import.meta.url));

const myWorker = new Worker(
    "telegramBot_queue",
    async (job) => {
        if (job.name === "video_resize") {
            if (fs.existsSync(`${__dirname}/resized.mp4`) == true) {
                fs.unlink("video.mp4", (err) => {
                    if (err) throw err;
                });
            }
            console.log("ok");
        }
    },
    {
        connection: {
            host: "127.0.0.1",
            port: 6379,
        },
    }
);
