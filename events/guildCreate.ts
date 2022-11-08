export async function handler(guild, logger) {
  logger.logWithHeader(
    "GUILD INVITE",
    "bgYellow",
    "black",
    ` Trying to join ${guild.name} #${guild.id} with ${guild.memberCount} members`,
    true
  );

  let loggerMsg = ` ${guild.name} #${guild.id}. Owned by ${guild.members.get(
    guild.ownerID
  )}`;

  if (guild.id !== "135632993145323520") {
    await guild.leave();
    logger.logWithHeader("LEFT GUILD", "bgRedBright", "black", loggerMsg, true);
  } else {
    logger.logWithHeader(
      "JOINED GUILD",
      "bgGreenBright",
      "black",
      loggerMsg,
      true
    );
  }
}
