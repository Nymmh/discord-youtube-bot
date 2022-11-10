import * as fs from "fs";

export async function clearQueueAndDownloads() {
  await fs.writeFileSync("./json/queue.json", JSON.stringify([]));

  let files = await fs.readdirSync("./songs");

  for (let file of files) {
    if (file.endsWith(".mp3")) {
      await fs.unlinkSync(`./songs/${file}`);
    }
  }
}
