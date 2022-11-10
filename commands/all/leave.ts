import { handleError } from "../../utils/tools.js";
import { clearQueueAndDownloads } from "../../helpers/clearQueueAndDownloads.js";

export class leave {
  static description: String = "The bot will leave the current voice channel.";
  static cooldown: Number = 5;
  static guildOnly: Boolean = true;

  /**
   * Initialize command manager
   * @arg {Client} BotClient
   * @arg {Eris.Message} msg
   */
  static async task(BotClient, msg) {
    BotClient.voiceConnections.map(async (vc) => {
      if (vc.id === msg.guildID) {
        try {
          let conn = await BotClient.leaveVoiceChannel(vc.channelID);
          global.BotConnection = conn;

          clearQueueAndDownloads();
        } catch (e) {
          handleError(BotClient, "leave.ts", msg.channel, e);
        }
      }
    });
  }
}
