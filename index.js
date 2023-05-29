require("dotenv/config");
const { Client, IntentsBitField } = require("discord.js");
const { Configuration, OpenAIApi } = require("openai");

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.on("ready", () => {
  console.log("The bot is online");
});

const configuration = new Configuration({
  apiKey: process.env.API_KEY,
});
const openai = new OpenAIApi(configuration);

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.channel.id !== process.env.CHANNEL_ID) return;
  if (!message.content.startsWith("$")) return;

  let conversationLog = [
    {
      role: "user",
      content: "Translate the following Mandarin text to English",
    },
  ];
  await message.channel.sendTyping();

  //   let prevMessage = await message.channel.messages.fetch({ limit: 15 });
  //   let signal = true;
  //   prevMessage.forEach((msg) => {
  //     if (msg.content === message.content || msg.content.startsWith("$")) {
  //       signal = false;
  //     }
  //   });
  conversationLog.push({
    role: "user",
    content: message.content,
  });
  try {
    const result = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: conversationLog,
    });
    const prompt =
      "An oil painting about " + result.data.choices[0].message.content;
    try {
      const image = await openai.createImage({
        prompt: prompt,
        n: 1,
        size: "1024x1024",
      });
      response = image.data.data[0].url;
      message.reply(response);
    } catch (error) {
      return message.reply(error.response.data.error.message);
    }
  } catch (error) {
    return message.reply(error.response.data.error.message);
  }
});

client.login(process.env.TOKEN);
