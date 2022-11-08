/**
 * @module settings
 */

/**
 * @arg {String} guildId id of the guild
 * @arg {String} [channelId] if of the channel
 * @arg {String} [message] the message
 * @returns {Promise} Bot promise
 */

/**
 * A list of available events
 * @const
 * @type {Array<String>}
 * @default
 */
const eventList = [];

/**
 * A list of commands loaded by the bot
 * @type {Object}
 */
var commandList = {};

export default { eventList, commandList };
