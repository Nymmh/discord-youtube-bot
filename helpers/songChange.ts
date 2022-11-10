import * as fs from "fs";

export async function songChange(end?: boolean) {
  let queueData = await fs.readFileSync(`./json/queue.json`, {
    encoding: "utf-8",
    flag: "r",
  });

  let queueDataParse = JSON.parse(queueData);

  if (end) {
    if (queueDataParse.length > 1) {
      queueDataParse.shift();
    } else {
      queueDataParse = [];
    }
  }

  await fs.writeFileSync("./json/queue.json", JSON.stringify(queueDataParse));

  if (global.BotConnection) {
    global.BotConnection.play(queueDataParse[0].song);
  }
}
