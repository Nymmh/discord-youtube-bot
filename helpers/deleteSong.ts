import * as fs from "fs";

import { Logger } from "../utils/logger.js";

export async function deleteSong() {
  let logger = new Logger(true);

  let queueData = await fs.readFileSync(`./json/queue.json`, {
    encoding: "utf-8",
    flag: "r",
  });

  let queueDataParse = JSON.parse(queueData);

  if (queueDataParse[0] && queueDataParse[0].song) {
    try {
      await fs.unlinkSync(queueDataParse[0].song);
    } catch (e) {
      logger.error(e);
    }
  }
}
