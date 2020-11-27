//  Description:
//    Inspect the data in redis easily
//
//  Commands:
//    hubot set tock line <line> - Associates a tock line with the current channel
//    hubot tock line - Display the tock line associated with the current channel, if any

const { directMention } = require("@slack/bolt");

const getTockLines = (robot) => {
  let tockLines = robot.brain.get("tockLines");
  if (!tockLines) {
    tockLines = {};
  }
  return tockLines;
};

module.exports = (robot) => {
  robot.message(
    directMention(),
    /tock( line)?$/i,
    ({ event: { channel, text, thread_ts: thread }, say }) => {
      const tockLines = getTockLines(robot);
      if (tockLines[channel]) {
        say({
          text: `The tock line for <#${channel}> is \`${tockLines[channel]}\``,
          thread_ts: thread,
        });
      } else {
        const botUserIDMatch = text.match(/^<@([^>]+)>/);
        const botUserID = botUserIDMatch[1];

        say({
          text: `I don't know a tock line for this room. To set one, say \`<@${botUserID}> set tock line <line>\``,
          thread_ts: thread,
        });
      }
    }
  );

  robot.message(
    directMention(),
    /set tock( line)? (.*)$/i,
    ({ context: { matches }, event: { channel, thread_ts: thread }, say }) => {
      const tockLines = getTockLines(robot);
      tockLines[channel] = matches[2];
      robot.brain.set("tockLines", tockLines);
      robot.brain.save();
      say({
        text: "Okay, I set the tock line for this room",
        thread_ts: thread,
      });
    }
  );
};
