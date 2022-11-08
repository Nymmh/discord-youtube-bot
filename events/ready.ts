export function ready(BotClient, logger, games) {
  BotClient.shards.forEach((shard) => {
    let playing = ~~(Math.random() * games.default.length);

    shard.editStatus(null, {
      name: games.default[playing],
      type: 0,
    });
  });

  logger.logWithHeader("Ready", "bgGreen", "black", "");
}
