import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

var __dirname = path.dirname(fileURLToPath(import.meta.url));

const check = fs.existsSync(`${__dirname}/video.mp4`);
console.log(check);

setInterval(() => {
    console.log("hello");
}, 1000);
