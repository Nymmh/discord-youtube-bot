import { createMessage } from "../../helpers/createMessage.js";
import { handleError } from "../../utils/tools.js";

export class join {
  static description: String = "The bot will join the channel you are in.";
  static cooldown: Number = 5;
  static guildOnly: Boolean = true;

  /**
   * Initialize command manager
   * @arg {Client} BotClient
   * @arg {Eris.Message} msg
   */
  static async task(BotClient, msg) {
    if (!msg.member.voiceState.channelID) {
      await createMessage(
        BotClient,
        msg,
        "Join a voice channel to use this command.",
        "join.ts"
      );

      return;
    }

    try {
      let conn = await BotClient.joinVoiceChannel(
        msg.member.voiceState.channelID
      );

      if (conn.playing) {
        await conn.stopPlaying();
      }

      await conn.setVolume(1.0);

      global.BotConnection = conn;
    } catch (e) {
      handleError(BotClient, "join.ts", msg.channel, e);
    }
  }
}
