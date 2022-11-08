import "dotenv/config";
import * as fs from "fs";
import Eris from "eris";

import { CommandManager } from "./utils/commandManager.js";
import { Logger } from "./utils/logger.js";
import settings from "./utils/settings.js";
import { validateConfig } from "./utils/validateConfig.js";

import * as _config from "./json/config.json";
import * as _games from "./json/games.json";

let logger;
let BotClient;
let managers: any[] = [];
let events: any = {};
let config = JSON.parse(JSON.stringify(_config));
let games = JSON.parse(JSON.stringify(_games));

function readyCommands() {
  managers = [];

  for (let prefix in config.default.commandSets) {
    managers.push(
      new CommandManager(config, prefix, config.default.commandSets[prefix].dir)
    );
  }
}

async function initReady(index = 0) {
  try {
    let manager = await managers[index].initialize(BotClient, config, settings);

    if (manager.length > index) {
      await initReady(index);
    }
  } catch (e) {
    logger.default(`Started the CommandManger ${index}`, "INIT");
  }
}

function initEvent(name) {
  if (name === "messageCreate") {
    BotClient.on("messageCreate", (msg) => {
      events["messageCreate"]["handler"](
        BotClient,
        msg,
        managers,
        config,
        settings
      );
    });
  } else if (name === "guildCreate") {
    BotClient.on("guildCreate", (guild) => {
      events["guildCreate"]["handler"](guild, logger);
    });
  } else if (name === "ready") {
    BotClient.on("ready", () => {
      events["ready"]["ready"](BotClient, logger, games);
    });
  } else {
    BotClient.on(name, () => {
      events[name][name](BotClient, settings, config, ...arguments);
    });
  }
}

async function loadEvents() {
  let files = fs.readdirSync("./dist/events/");

  for (let file of files) {
    if (file.endsWith(".ts")) continue;
    if (file.endsWith(".js")) {
      file = file.replace(/\.js$/, "");

      try {
        events[file] = await import(`./dist/events/${name}.js`);
        initEvent(name);
      } catch (e) {
        logger.erorr(
          `${e}\n${e.stack}`,
          "Error loading " + file.replace(/\.js$/, "")
        );
      }
    }
  }
}

function miscEvents() {
  return new Promise((resolve) => {
    if (BotClient.listeners("shardReady").length === 0) {
      BotClient.on("shardReady", (id) => {
        logger.logBold(`Shard ${id} connected`, "green");
      });
    }

    if (BotClient.listeners("disconected").length === 0) {
      logger.logBold("Disconected from Discord", "red");
    }

    return resolve(null);
  });
}

async function login() {
  logger.logBold(`Loggin in...`, "green");

  try {
    await BotClient.connect();
  } catch (e) {
    logger.error(e, "Login Error");
  }
}

const init = async () => {
  try {
    await validateConfig(config);
  } catch (e) {
    process.exit(e);
  }

  logger = new Logger(config.default.logTimestamp);

  BotClient = Eris(process.env.token as string, {
    intents: ["guildMembers", "guildMessages", "directMessages", "guilds"],
    autoreconnect: true,
    maxReconnectAttempts: Infinity,
    getAllUsers: true,
    messageLimit: 100,
    disableEvents: config.default.disableEvents,
  });

  try {
    readyCommands();
    await initReady();
    await loadEvents();
    miscEvents();
    await login();
  } catch (e) {
    logger.error(e, "Error in ready");
  }
};

setInterval(() => {
  if (
    games.length !== 0 &&
    BotClient.uptime !== 0 &&
    config.default.cycleGames === true
  ) {
    BotClient.shards.forEach((shard) => {
      let game = games[~~(Math.random() * games.length)];

      shard.editStatus(null, {
        name: name,
        type: 0,
      });
    });
  }
}, 600000);

process.on("SIGINT", () => {
  BotClient.disconect({ reconnect: false });

  setTimeout(() => {
    process.exit(0);
  }, 5000);
});

type discordError = {
  code: number;
};

process.on("uncaughtException", (err: discordError) => {
  logger.error(err);

  if (err.code == 1006 || err.code == 1001) {
    login();
  }
});

process.on("unhandledRejection", (err) => {
  logger.error(err);
});

init();
