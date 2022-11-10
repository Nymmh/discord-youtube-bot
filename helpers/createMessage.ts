import { handleError } from "../utils/tools.js";
import { Logger } from "../utils/logger";
let logger;

export async function createMessage(BotClient, msg, content, command) {
  try {
    await BotClient.createMessage(msg.channel.id, content);
    return;
  } catch (e) {
    handleError(BotClient, command, msg.channel, e);
    logger.error(e);
  }
}
