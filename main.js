require("dotenv").config();
const { App } = require("@slack/bolt");
const fs = require("fs").promises;
const { setClient } = require("./utils/slack");

const app = new App({
  token: process.env.SLACK_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

app.logger.setName("18F Charlie bot");

const BRAIN = new Map();
app.brain = {
  get: BRAIN.get.bind(BRAIN),
  set: BRAIN.set.bind(BRAIN),
  save() {},
};

app.respond = (trigger, callback) => {
  const regex = new RegExp(trigger);
  app.event("app_mention", (message) => {
    const text = message.event.text;

    if (regex.test(text)) {
      callback({
        ...message,
        context: { ...message.context, matches: text.match(regex) },
      });
    }
  });
};

const port = process.env.PORT || 3000;
app.start(port).then(async () => {
  app.logger.info(`Bot started on ${port}`);
  setClient(app.client);

  const files = (await fs.readdir("scripts")).filter((file) =>
    file.endsWith(".js")
  );
  files.forEach((file) => {
    const script = require(`./scripts/${file}`); // eslint-disable-line global-require,import/no-dynamic-require
    if (typeof script === "function") {
      app.logger.info(`Loading bot script from: ${file}`);
      script(app);
    }
  });
});
