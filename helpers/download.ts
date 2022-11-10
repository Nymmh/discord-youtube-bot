import ytdl from "youtube-dl.js";
import mp3Duration from "mp3-duration";
import * as fs from "fs";

export async function download(url: string, title: string) {
  let filename = `./songs/${title}.%(ext)s`;
  let args = [
    "-o",
    filename,
    "-x",
    "--audio-format=mp3",
    "--restrict-filenames",
    "--external-downloader=ffmpeg",
    "--audio-quality=96k",
  ];

  try {
    await ytdl(url, args);
    let duration = await mp3Duration(`./songs/${title}.mp3`);
    let queueData = await fs.readFileSync(`./json/queue.json`, {
      encoding: "utf-8",
      flag: "r",
    });
    let queueDataParse = JSON.parse(queueData);
    queueDataParse.push({
      song: `./songs/${title}.mp3`,
      duration: duration,
    });

    await fs.writeFileSync("./json/queue.json", JSON.stringify(queueDataParse));
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}
