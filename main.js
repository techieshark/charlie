require("dotenv").config();
const { App } = require("@slack/bolt");
const script = require("./scripts/timezone");

const app = new App({
  token: process.env.SLACK_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

app.respond = (trigger, callback) => {
  const regex = new RegExp(trigger);
  app.event("app_mention", (message) => {
    const text = message.event.text;

    if (regex.test(text)) {
      callback(message);
    }
  });
};

script(app);

const port = process.env.PORT || 3000;
app.start(port).then(() => {
  console.log(`Yay, started on ${port}`);
});
