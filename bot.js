import { Input, Telegraf } from "telegraf";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Queue } from "bullmq";

var __dirname = path.dirname(fileURLToPath(import.meta.url));

const api_token = "";
const bot = new Telegraf(api_token);

const queue = new Queue("telegramBot_queue", {
    connection: {
        host: "127.0.0.1",
        port: 6379,
    },
});

bot.use(async (ctx) => {
    if (ctx.message.video || ctx.message.caption) {
        try {
            let file_id = ctx.message.video.file_id;
            let vid_link = await ctx.telegram.getFileLink(file_id);

            const job = await queue.add(
                "video_dwnld",
                { video_link: vid_link },
                { removeOnComplete: true, delay: 300 }
            );

            // const jobID = job.id;

            // const jobStatus = await queue.getJob(jobID);
            // if (jobStatus) {
            //     // Job is added and being processed
            //     console.log(
            //         "Job is added and processing:",
            //         jobStatus.data.video_link
            //     );
            // } else {
            //     // Job is not found
            //     console.log("Job not found");
            // }

            // if (fs.existsSync(`${__dirname}/resized.mp4`)) {

            // }

            bot.telegram.sendMessage(ctx.chat.id, "Choose", {
                reply_markup: {
                    one_time_keyboard: true,
                    resize_keyboard: true,
                    keyboard: [
                        [
                            {
                                text: "Resize the video",
                                one_time_keyboard: true,
                            },
                            {
                                text: "Check the existence",
                                one_time_keyboard: true,
                            },
                        ],
                    ],
                },
            });

            // }
        } catch (err) {
            console.log(err);
        }
    } else if (
        ctx.message.text == "Check the existence" &&
        fs.existsSync(`${__dirname}/resized.mp4`) == true
    ) {
        ctx.replyWithVideo(Input.fromLocalFile("./resized.mp4"));
    } else if (
        ctx.message.text == "Resize the video" &&
        fs.existsSync(`${__dirname}/video.mp4`)
    ) {
        await queue.add(
            "video_resize",
            { msg: "Ok" },
            { removeOnComplete: true, delay: 300 }
        );
        bot.telegram.sendMessage(
            ctx.chat.id,
            "Wait, Your video is being resized!",
            {
                reply_markup: {
                    one_time_keyboard: true,
                    resize_keyboard: true,
                    keyboard: [
                        [
                            {
                                text: "Check the existence",
                                one_time_keyboard: true,
                            },
                        ],
                    ],
                },
            }
        );
    }
});

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function RandArray(array) {
    var rand = (Math.random() * array.length) | 0;
    var rValue = array[rand];
    return rValue;
}

bot.launch();

process.once("SIGINT", () => {
    bot.stop("SIGINT");
});

process.once("SIGTERM", () => {
    bot.stop("SIGTERM");
});
