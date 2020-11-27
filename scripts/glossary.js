// Description:
//   Ask for an explanation of an abbreviation/jargon
//
// Depdeendencies:
//   "js-yaml": "3.4.1"
//
// Commands:
//   hubot glossary <abbreviation> - returns a defined term
//
// Examples:
//   hubot glossary ATO

const { directMention } = require("@slack/bolt");
const axios = require("axios");
const yaml = require("js-yaml");

const findCaseInsensitively = (list, searchTerm) => {
  const lowerSearch = searchTerm.toLowerCase();
  for (let i = 0; i < list.length; i += 1) {
    const term = list[i];
    if (term.toLowerCase() === lowerSearch) {
      return term;
    }
  }
  return null;
};

module.exports = (robot) => {
  robot.message(
    directMention(),
    /(glossary|define) (.+)/i,
    async ({ event: { thread_ts: thread }, context, say }) => {
      const { data } = await axios.get(
        "https://api.github.com/repos/18f/procurement-glossary/contents/abbreviations.yml"
      );

      // GitHub sends back an object with metadata. The actual content is
      // a base64-encoded property on the response body.
      const abbreviations = yaml.safeLoad(
        Buffer.from(data.content, "base64").toString(),
        {
          json: true,
        }
      ).abbreviations;

      const searchTerm = context.matches[2].trim();
      const terms = Object.keys(abbreviations);
      const term = findCaseInsensitively(terms, searchTerm);

      const response = {
        icon_emoji: ":books:",
        thread_ts: thread,
      };

      if (term) {
        response.text = `The term *${abbreviations[term].longform} (${term})* means ${abbreviations[term].description}`;
      } else {
        response.text = `I don't know what *${searchTerm}* means. If you'd like to add it, the project is at https://github.com/18F/procurement-glossary.`;
      }

      say(response);
    }
  );
};
