import "dotenv/config";

import { Logger } from "./logger.js";
var logger;

export function validateConfig(config: any) {
  if (logger === undefined) logger = new Logger(config.default.logTimestamp);

  if (!process.env.APItoken) {
    logger.error("Missing token");
    throw new Error();
  }

  for (let prefix in config.default.commandSets) {
    if (prefix === "") {
      logger.error("A commandSet has no prefix");
      throw new Error();
    } else if (!config.default.commandSets[prefix].hasOwnProperty("dir")) {
      logger.error("Must define a dir commandSet " + prefix);
      throw new Error();
    }
  }

  if (!config.default.adminIds || config.default.adminIds.length < 1) {
    logger.error("You must define an Admin Id");
    throw new Error();
  } else if (
    typeof config.default.adminIds[0] !== "string" ||
    config.default.adminIds[0] === ""
  ) {
    logger.error("Admin Id must be a string");
    throw new Error();
  }

  if (
    typeof config.default.reloadCommand !== "string" ||
    config.default.reloadCommand === ""
  ) {
    logger.error("The reloadCommand must be a string");
    throw new Error();
  }

  if (typeof config.default.logTimestamp !== "boolean") {
    logger.error("logTimestamp must be a boolean");
    throw new Error();
  }

  if (typeof config.default.cycleGames !== "boolean") {
    logger.error("cycleGames must be a boolean");
    throw new Error();
  }

  logger.logBold("Config valid", "green");

  // Garbage clean up
  logger = undefined;
}
