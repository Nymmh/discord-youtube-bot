import chalk from "chalk";
import * as fs from "fs";

const log = "./log.txt";
/**
 * @class Logger
 * @classdesc Logger for the bot
 */

export class Logger {
  logTimestamp: Boolean;

  /**
   * @constructor
   * @arg {Boolean} logTimestamp if the timestamp should be logged
   */
  constructor(logTimestamp) {
    this.logTimestamp = logTimestamp;
  }

  /**
   * @type {String}
   */
  get timestamp() {
    return this.logTimestamp ? `[${new Date().toLocaleDateString()}]` : "";
  }

  /**
   * How commands will be logged
   * @arg {String} [guildName] the name of the server
   * @arg {String} username the username of the user
   * @arg {String} commandName the command that was used
   * @arg {String} suffix the args of the command
   */
  async logCommand(guildName, username, commandName, suffix) {
    try {
      await fs.promises.appendFile(
        log,
        this.timestamp + `${guildName} ${username} > ${commandName} ${suffix}\r`
      );
    } catch (e) {
      this.error(e);
    }

    console.log(
      this.timestamp +
        `${chalk.magenta.bold(guildName)} ${chalk.bold.green(
          username
        )} > ${commandName} ${suffix}`
    );
  }

  /**
   * @arg {String} text
   */
  async error(text) {
    try {
      await fs.promises.appendFile(log, this.timestamp + `${text}\r`);
    } catch (e) {
      return this.error(this.timestamp + `${chalk.bgRed.black(`ERROR`)} ${e}`);
    }
    return console.log(
      this.timestamp + `${chalk.bgRed.black(`ERROR`)} ${text}`
    );
  }

  /**
   * @arg {String} headerText
   * @arg {String} headerBackground A valid [chalk background color]{@link https://github.com/chalk/chalk#background-colors}.
   * @arg {String} headercolor A valid [chalk color]{@link https://github.com/chalk/chalk#colors}.
   * @arg {String} text
   * @arg {String} [color] A valid chalk color.
   * @arg {Boolean} write
   */
  async logWithHeader(
    headerText,
    headerBackground,
    headerColor,
    text,
    write,
    color
  ) {
    if (write) {
      try {
        fs.promises.appendFile(
          log,
          this.timestamp + ` >> ${headerText} > ${text}\r`
        );
      } catch (e) {
        this.error(e);
      }
    }
    console.log(
      this.timestamp + chalk[headerBackground][headerColor](` ${headerText} `),
      color ? chalk[color](text) : text
    );
  }

  /**
   * @arg {String} text
   * @arg {String} [color]
   */
  async logBold(text, color) {
    try {
      await fs.promises.appendFile(log, this.timestamp + `${text}\r`);
    } catch (e) {
      return this.error(this.timestamp + `${chalk.bgRed.black(`ERROR`)} ${e}`);
    }
    return console.log(
      this.timestamp + (color ? chalk.bold[color](text) : chalk.bold(text))
    );
  }

  /**
   * @arg {String} text
   * @arg {String} [debugText="DEBUG"]
   */
  debug(text, debugText = "DEBUG") {
    return console.log(
      this.timestamp + `${chalk.bgWhite.black(`${debugText}`)} ${text}`
    );
  }
}
