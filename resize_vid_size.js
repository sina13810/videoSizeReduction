import axios from "axios";
import { fileURLToPath } from "url";
import fs from "fs";
import { Worker, Queue } from "bullmq";
import { exec, spawn } from "child_process";
import path from "path";

let writable;
var __dirname = path.dirname(fileURLToPath(import.meta.url));

const myWorker = new Worker(
    "telegramBot_queue",
    async (job) => {
        if (job.name === "video_resize") {
            if (fs.existsSync(`./video.mp4`) == true && job.data.msg == "Ok") {
                console.log(job.data.msg);
                // Usage
                const inputPath = "./video.mp4";
                const outputPath = "./resized.mp4";
                const width = 640; // Desired width
                const height = 480; // Desired height

                resizeVideo2(inputPath, outputPath, width, height);
            }
        }
    },
    {
        connection: {
            host: "127.0.0.1",
            port: 6379,
        },
    }
);

// Function to resize video using ffmpeg
function resizeVideo(inputPath, outputPath, width, height) {
    // ffmpeg command to resize the video
    const command = `ffmpeg -i "${inputPath}" -vf "scale=${width}:${height}" "${outputPath}"`;

    // Execute the command
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`ffmpeg stderr: ${stderr}`);
            return;
        }
        console.log("Video resized successfully");
    });
}

function resizeVideo2(inputPath, outputPath, width, height) {
    // ffmpeg command arguments
    const args = [
        "-i",
        inputPath,
        "-vf",
        `scale=${width}:${height}`,
        outputPath,
    ];

    // Spawn ffmpeg process
    const ffmpegProcess = spawn("ffmpeg", args);

    // Listen for errors
    ffmpegProcess.on("error", (error) => {
        console.error(`Error: ${error.message}`);
    });

    // Listen for process exit
    ffmpegProcess.on("exit", (code, signal) => {
        if (code === 0) {
            console.log("Video resized successfully");
        } else {
            console.error(
                `ffmpeg process exited with code ${code} and signal ${signal}`
            );
        }
    });
}
