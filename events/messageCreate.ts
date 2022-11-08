export async function handler(BotClient, msg, managers, config, settings) {
  if (msg.author.bot) return;

  let sendMessageRan = 0;

  for (let i = 0; i < managers.length; i++) {
    if (msg.content.startsWith(managers[i].prefix)) {
      await managers[i].processCommand(BotClient, msg, config, settings);
      return;
    }
  }
}
