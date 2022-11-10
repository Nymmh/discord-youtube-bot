import { createMessage } from "../../helpers/createMessage.js";
import { handleError } from "../../utils/tools.js";
import { download } from "../../helpers/download.js";
import { songChange } from "../../helpers/songChange.js";
import { deleteSong } from "../../helpers/deleteSong.js";
import { Logger } from "../../utils/logger.js";

export class play {
  static description: String = "Play a song";
  static cooldown: Number = 5;
  static guildOnly: Boolean = true;

  /**
   * Initialize command manager
   * @arg {Client} BotClient
   * @arg {Eris.Message} msg
   */
  static async task(BotClient, msg, suffix) {
    let dl = await download(suffix, msg.embeds[0].title);

    if (dl) {
      if (global.BotConnection.playing) return;
      songChange(false);

      global.BotConnection.on("end", () => {
        new Logger(true).debug("End fired");

        try {
          deleteSong();
        } catch (e) {
          new Logger(true).error(e);
        }

        try {
          songChange(true);
        } catch (e) {
          new Logger(true).error(e);
        }
      });
    } else {
      await createMessage(BotClient, msg, "Failed to download song", "play.ts");
    }
  }
}
