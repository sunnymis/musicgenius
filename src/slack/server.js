const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const { createEventAdapter } = require("@slack/events-api");
const constants = require("../constants");
const app = express();
const portEvents = 4000;
const portCommands = 5000;

const signingSecret = process.env.SLACK_SIGNING_SECRET;
const slackEvents = createEventAdapter(signingSecret);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

(async () => {
  await slackEvents.start(portEvents);
  console.log(
    `Slack Server started. Listening for message events on port ${portEvents}`
  );
})();

app.listen(portCommands, () => {
  console.log(
    `Slack Server started. Listening for slash commands on port ${portCommands}`
  );
});

slackEvents.on("message", async (event) => {
  if (event.type === "message") {
    if (event.text && event.text.includes("https://open.spotify.com/track")) {
      try {
        const response = await axios({
          url: `${constants.BASE_SERVER_URL}/playlist`,
          method: "post",
          data: {
            song: event.text,
          },
        });

        console.log(
          "Successfully added song",
          response.status,
          response.statusText
        );
      } catch (error) {
        console.log("Error adding song", error);
      }
    }
  }
});

app.post("/command", async (req, res) => {
  try {
    const { text } = req.body;
    const [name, description] = text.split(",");

    const response = await axios({
      url: `${constants.BASE_SERVER_URL}/playlists`,
      method: "post",
      data: {
        name,
        description,
      },
    });

    console.log("Successfully created playlist", response);

    const responseJSON = JSON.stringify({
      response_type: "in_channel",
      text: `Here\'s your playlist!\n ${response.data}`,
    });

    res.setHeader("Content-Type", "application/json");
    res.send(responseJSON);
  } catch (error) {
    console.log("Error creating playlist", error);

    res.send("Whoops! Something went wrong creating a playlist", error);
  }
});
