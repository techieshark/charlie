const { cache } = require("./cache");

let defaultClient = {};

const setClient = (client) => {
  defaultClient = client;
};

const addEmojiReaction = async (msg, reaction) => {
  const {
    client,
    event: { channel, ts: timestamp },
  } = msg;

  return client.reactions.add({ name: reaction, channel, timestamp });
};

/**
 * Fetch a list of Slack users in the workspace that this bot is in.
 * @async
 * @param {Object} robot Hubot robot object
 * @returns {Promise<Array<Object>>} A list of Slack users.
 */
const getSlackUsers = async () => {
  return cache("get slack users", 60, async () => {
    const { members } = await defaultClient.users.list({
      token: process.env.SLACK_TOKEN,
    });
    return members;
  });
};

const getSlackUsersInConversation = async ({ client, event: { channel } }) => {
  return cache(`get slack users in conversation ${channel}`, 10, async () => {
    const { members: channelUsers } = await client.conversations.members({
      channel,
    });
    const allUsers = await getSlackUsers(client);

    return allUsers.filter(({ id }) => channelUsers.includes(id));
  });
};

const postEphemeralResponse = async (toMsg, message) => {
  const {
    client,
    event: { channel, thread_ts: thread, user },
  } = toMsg;
  try {
    await client.chat.postEphemeral({
      ...message,
      user,
      channel,
      thread_ts: thread,
    });
  } catch (e) {
    console.log(JSON.stringify(message, null, 2));
    console.log(e);
  }
};

const postMessage = async (message) =>
  defaultClient.chat.postMessage({
    ...message,
    token: process.env.SLACK_TOKEN,
  });

module.exports = {
  addEmojiReaction,
  getSlackUsers,
  getSlackUsersInConversation,
  postEphemeralResponse,
  postMessage,
  setClient,
};
