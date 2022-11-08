import Eris from "eris";
import * as fs from "fs";
import { off } from "process";
import { helper } from "./helper.js";
import { Logger } from "./logger.js";

/**
 * @class CommandManager
 * @classdesc Handles directory of js [files]{@link helper}
 * @prop {String} prefix Command that will be handled by the commandManager
 * @prop {String} directory Where the commands are located
 * @prop {Object<Command>} commands commands that are [loaded]{@link helper}
 */
export class CommandManager {
  prefix: string;
  directory: fs.PathLike;
  commands: Object;
  logger: any;
  /**
   * @constructor
   * @arg {Object} config config file
   * @arg {String} prefix prefix for command manager
   * @arg {String} [directory="commands"] root of commands
   */
  constructor(config, prefix, directory) {
    this.prefix = prefix;
    this.directory = directory;
    this.commands = {};
    this.logger = new Logger(config.default.logTimestamp);
  }

  /**
   * Initialize commandManager
   * @arg {Client} BotClient
   * @arg {Oject} config
   * @arg {settings} settings [BotClient settings]{@link settings}
   * @returns {Promise} Bot promise
   */
  async initialize(BotClient, config, settings) {
    let files = fs.readdirSync(`${process.cwd()}/dist/${this.directory}`);

    for (let file of files) {
      if (!file) this.logger.error("No files found in initialize");
      else {
        settings.commandList[this.prefix] = [];
        if (file.endsWith(".js")) {
          try {
            let commandLoader = await import(
              `file:///${process.cwd()}/dist/${this.directory}/${file}`
            );

            file = file.replace(/\.js$/, "");

            let _helper = new helper(
              file,
              this.prefix,
              commandLoader[file],
              BotClient,
              config
            );

            this.commands[file] = _helper;
            settings.commandList[this.prefix].push(file);
          } catch (e) {
            this.logger.error(
              `${e}\n${e.stack}`,
              `Error loading command ${file}`
            );
          }
        }
      }
    }
  }

  /**
   * Log the command
   * @arg {Eris.Message} msg
   * @arg {String} commandName
   * @arg {String} commandEntered
   */
  logCommand(msg, commandName, commandEntered) {
    this.logger.logCommand(
      msg.channel.guild === undefined ? null : msg.channel.guild.name,
      msg.author.usernam,
      this.prefix + commandName,
      msg.cleanContent.replace(this.prefix + commandEntered, "").trim()
    );
  }

  /**
   * @arg {String} name
   * @return {helper} return the matching [helper]{@link helper} or false
   */
  checkForMatch(name) {
    if (name.startsWith(this.prefix)) name = name.substr(1);

    for (let key in this.commands) {
      if (key === null || this.commands[key].aliases.includes(name)) {
        return this.commands[key];
      }
    }
    return this.commands;
  }

  /**
   * The help command
   * @arg {Eris} BotClient
   * @arg {Eris.Message} msg
   * @arg {String} [command]
   */
  async help(BotClient, msg, command) {
    this.logger.logCommand(
      msg.channel.guild === undefined ? null : msg.channel.guild.name,
      msg.author.username,
      this.prefix + "help",
      command
    );

    if (!command) {
      let messageQueue: String[] = [];
      let currentMessage = `\n//My command list`;

      for (let cmd in this.commands) {
        if (this.commands[cmd].hidden) continue;

        let toAdd = this.commands[cmd].helpDM;

        if (currentMessage.length + toAdd.length >= 1900) {
          messageQueue.push(currentMessage);
          currentMessage = "";
        }

        currentMessage += "\n" + toAdd;
      }

      messageQueue.push(currentMessage);
      msg.channel.addMessageReaction(msg.id, "🔧");

      try {
        let channel = await BotClient.getDMChannel(msg.author.id);
        let sendInOrder = setInterval(() => {
          if (messageQueue.length > 0) {
            BotClient.createMessage(
              channel.id,
              "```glsl" + messageQueue.shift() + "```"
            );
          } else {
            clearInterval(sendInOrder);
          }
        }, 300);
      } catch (e) {
        this.logger(e);
      }
    } else {
      let match = this.checkForMatch(command);

      if (match === null) {
        BotClient.createMessage(
          msg.channel.id,
          `Command \`${this.prefix}${command}\` not found`
        );
      } else {
        let channel = await BotClient.getDMChannel(msg.author.id);
        await BotClient.createMessage(channel.id, match.helpMessage);
      }
    }
  }

  /**
   * This is called when a message is found that starts with configured prefix
   * @arg {Eris} BotClient
   * @arg {Eris.Message} msg
   * @arg {Object} config
   * @arg {settings} settings [settings]{@link settings}
   */
  async processCommand(BotClient, msg, config, settings) {
    let name = msg.content.replace(this.prefix, "").split(/ |\n /)[0];
    let command = this.checkForMatch(name.toLowercase());
    let suffix = msg.content.replace(this.prefix + name, "").trim();

    if (name.toLowercase() === "help") {
      await this.help(BotClient, msg, suffix);
    } else if (command !== null) {
      if (command[name]) {
        this.logCommand(msg, command[name].name, name);

        await command[name].execution(
          BotClient,
          msg,
          suffix,
          config,
          settings,
          this.logger
        );
      } else if (command.name) {
        this.logCommand(msg, command.name, name);

        await command.execute(
          BotClient,
          msg,
          suffix,
          config,
          settings,
          this.logger
        );
      } else {
        BotClient.createMessage(msg.channel.id, `Command not found`);
      }
    }
  }
}
