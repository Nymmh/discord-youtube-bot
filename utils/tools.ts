/**
 * Error printing
 * @param {Object} BotClient
 * @param {String} commandUsed
 * @param {Object} channel
 * @param {Object|String} error
 */
export async function handleError(BotClient, commandUsed, channel, error) {
  await channel.createMessage({
    content: ``,
    embed: {
      color: 0x9a3737,
      author: {
        name: ``,
        url: ``,
        icon_url: ``,
      },
      description: `${error}\n\nError help me, please.`,
    },
  });
}
