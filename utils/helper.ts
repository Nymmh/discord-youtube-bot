/**
 * @class helper
 * @classdesc This file contains helper functions for commands
 * @prop {String} name Command name
 * @prop {String} prefix Command prefix
 * @prop {String} usage How to use the command
 * @prop {String} description Description of the command
 * @prop {String} help Details of how to use the command
 * @prop {Function} task Is ran when the command is executed
 * @prop {Array<String>} aliases The alias of the command
 * @prop {Number} cooldown The cooldown of the command in seconds
 * @prop {Boolean} hidden If the command is hidden from the help command
 * @prop {Boolean} guildOnly If the command can only be executed in a server
 * @prop {Set} usersOnCooldown Tracks what uses are cooldown, stored in memory
 * @prop {Function} destroyFunction The destroy function
 */

export class helper {
  name: String;
  prefix: String;
  usage: String;
  description: String;
  help: String;
  task: Function;
  aliases: String[];
  cooldown: Number;
  hidden: Boolean;
  guildOnly: Boolean;
  usersOnCooldown: Set<Number>;
  destoryFunction: Function;
  /**
   * @constructor
   * @arg {String} name
   * @arg {String} prefix
   * @arg {Object} bot
   * @arg {String} [bot.usage='']
   * @arg {String} [bot.description='No description']
   * @arg {String} [bot.help='No help message']
   * @arg {String} bot.task
   * @arg {Array<String>} [bot.aliases=[]]
   * @arg {Number} [bot.cooldown=0]
   * @arg {Boolean} [bot.hidden=false]
   * @arg {Boolean} [bot.guildOnly=false]
   * @arg {Function} [bot.initialize]
   * @arg {Function} [bot.destroy]
   * @arg {Client} BotClient
   * @arg {Object} config
   */
  constructor(name, prefix, bot, BotClient, config) {
    this.name = name;
    this.prefix = prefix;
    this.usage = bot.usage || "";
    this.description = bot.description || "No description";
    this.help = bot.help || bot.description || this.description;
    this.task = bot.task;
    this.aliases = bot.aliases || [];
    this.cooldown = bot.cooldown || 0;
    this.hidden = !!bot.hidden;
    this.usersOnCooldown = new Set();
    this.destoryFunction = bot.destroy;

    if (typeof bot.initialize === "function") {
      bot.initialize(BotClient, config);
    }
  }

  /**
   * @name correctUsage
   * @description
   * @type {String}
   * @returns {String}
   */
  get correctUsage() {
    return `${this.prefix}${this.name} ${this.usage}`;
  }

  /**
   * @name helpDM
   * @description
   * @type {String}
   * @returns {String}
   */
  get helpDM() {
    return `${this.prefix}${this.name} ${this.usage}\n\t ${this.description}`;
  }

  /**
   * @name helpMessage
   * @description
   * @type {String}
   * @returns {String}
   */
  get helpMessage() {
    return `**=> Command:**\`${this.prefix}${this.name} ${this.usage}\`
            **=> Info:** ${this.help}
            **=> Cooldown:** ${this.cooldown} seconds
            **=> Aliases:** ${this.aliases.join(", ") || "None"}`;
  }

  /**
   * @name execution
   * @description
   * @arg {Eris} BotClient
   * @arg {Eris.Message} msg
   * @arg {String} suffix
   * @arg {Object} config
   * @arg {settingsManger} settingsManger
   */
  async execution(BotClient, msg, suffix, config, settingsManger, logger) {
    if (this.guildOnly && msg.channel.guild === undefined) {
      await msg.channel.createMessage(
        "This command can only be used in a server."
      );
    } else if (this.usersOnCooldown.has(msg.author.id)) {
      try {
        let sentMsg = await msg.channel.createMessage(
          `${msg.author.username}, this command only be used every ${this.cooldown} seconds.`
        );
        setTimeout(() => {
          msg.delete();
          sentMsg.delete();
        }, 6000);
      } catch (e) {
        logger.error(e);
      }
    }

    let result;

    try {
      result = await this.task(BotClient, msg, suffix, config, settingsManger);
    } catch (e) {
      logger.error(e);

      if (config.default.errorMessage) {
        msg.channel.createMessage(config.default.errorMessage);
      }
    }

    if (result === "wrong usage") {
      try {
        let sentMsg = await msg.channel.createMessage(
          `${msg.author.username}, use the following format to execute the command: \n**\`${this.prefix}${this.name} ${this.usage}\`**`
        );
        setTimeout(() => {
          msg.delete();
          sentMsg.delete();
        }, 10000);
      } catch (e) {
        logger.error(e);
      }
    } else if (!config.default.adminIds.includes(msg.author.id)) {
      this.usersOnCooldown.add(msg.author.id);

      setTimeout(() => {
        this.usersOnCooldown.delete(msg.author.id);
      }, Number(this.cooldown) * 1000);
    }
  }

  async findMembers(msg, str) {
    if (!str || str === "") return false;

    const guild = msg.channel.guild;

    if (!guild) {
      return msg.mentions[0] ? msg.mentions[0] : false;
    }

    if (/^\d{17,18}/.test(str) || /^<@!?\d{17,18}>/.test(str)) {
      const member = await guild.member.get(
        /^<@!?\d{17,18}>/.test(str)
          ? str.replace(/<@!?/, "").replace(">", "")
          : str
      );

      return member ? member.user : false;
    } else if (str.length <= 33) {
      const isMemberName = (name, str) =>
        name === str || name.startsWith(str) || name.includes(str);

      const member = guild.member.find((m) => {
        if (m.nick && isMemberName(m.nick.toLowerCase(), str.toLowerCase())) {
          return true;
        }

        return isMemberName(m.user.username.toLowerCase(), str.toLowerCase());
      });

      return member ? member.user : false;
    } else return false;
  }

  /**
   * @name destory
   */
  destory() {
    if (typeof this.destoryFunction === "function") {
      this.destoryFunction();
    }
  }
}
