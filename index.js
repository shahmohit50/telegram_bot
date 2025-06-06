// const express = require("express");
// const axios = require("axios");
// const app = express();
// app.use(express.json());

// const TELEGRAM_BOT_TOKEN = process.env.BOT_TOKEN;
// const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// app.post("/webhook", async (req, res) => {
//   const message = req.body.message?.text;
//   const chatId = req.body.message?.chat?.id;
//   const firstName = req.body.message?.chat?.first_name || "there";

//   if (!message || !chatId) return res.sendStatus(200);

//   try {
//     if (message.includes("https://goo")) {
//       const scraped = await axios.get(message, {
//         headers: {
//           Accept: "application/rss+xml",
//           "User-Agent":
//             "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/136.0.0.0 Safari/537.36",
//         },
//       });

//       await axios.post(`${TELEGRAM_API}/sendMessage`, {
//         chat_id: chatId,
//         text: `Scraped content:\n\n${scraped.data.substring(0, 1000)}`, // keep it short
//       });
//     } else if (message === "http://") {
//       await axios.get(message); // will likely fail, but mimics your original condition
//     } else {
//       await axios.post(`${TELEGRAM_API}/sendMessage`, {
//         chat_id: chatId,
//         text: `Hi ${firstName}, Kindly add a URL to parse. We scrape and get the body data.`,
//       });
//     }

//     res.sendStatus(200);
//   } catch (err) {
//     console.error(err);
//     res.sendStatus(500);
//   }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

const TELEGRAM_BOT_TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

app.post("/webhook", async (req, res) => {
  const message = req.body.message?.text;
  const chatId = req.body.message?.chat?.id;
  const firstName = req.body.message?.chat?.first_name || "there";

  if (!message || !chatId) return res.sendStatus(200);

  try {
    if (message.includes("https://lid")) {
      for( let j = 0; j < 3; j++) {
      let number = Number(message.match(/(\d+)/)[1])+ j;
      let url = message.slice(0, -5) + number;
      const scraped = await axios.get(url, {
        headers: {
          Accept: "application/rss+xml",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/136.0.0.0 Safari/537.36",
        },
      });
      const bodyMatch = scraped.data.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if(!bodyMatch){
      return;
      }
      const bodyContent = bodyMatch ? bodyMatch[1].replace(/<[^>]+>/g, '').trim() : 'No body content found.';
      let cleanedContent = bodyContent.replace(/\(function\s*\([\s\S]*?\)\s*\{[\s\S]*?\}\s*\)\s*\([\s\S]*?\);?/g, '').trim(); // Clean up whitespace

      const phrase = "Son Of The Dragon Chapter";
      const regex = new RegExp(`(${phrase})(?!.*${phrase}).*$`, "gis");
      cleanedContent = cleanedContent.replace(regex, "$1");
      let index = cleanedContent.indexOf("Son Of The Dragon Chapter");
      if (index === -1) {
        return;
      }
      let edContent = index !== -1 ? cleanedContent.substring(index) : "Phrase not found.";
      edContent = edContent.trim();

      edContent = edContent.replace(/\n\t+/g, '');
      edContent = edContent.replace(/\t\n+/g, '');
      edContent = edContent.replace(/"function"==typeof\s+[a-zA-Z0-9_]+\s*&&[\s\S]*?;/g, '');
      edContent = edContent.replace(/if\s*\([^)]+\)\s*\{[^}]*\}/g, '');
      edContent = edContent.replace(/\\n\s*/g, '\n');
      edContent = edContent.replace(/\\n\s*\\n\s*\\n/g, '\n\n');
      edContent = edContent.replace(/\\n\s*\\n/g, '\n');
      edContent = edContent.replace(/\\n/g, '\n');
      edContent = edContent.replace(/\n{3,}/g, '\n\n');
      if (edContent.length > 3900) {
        for (let i = 0; i < edContent.length; i += 3900) {
          // bot.sendMessage(chatId, edContent.substring(i, i + 3900));
          await axios.post(`${TELEGRAM_API}/sendMessage`, {
            chat_id: chatId,
            text: `${edContent.substring(i, i + 3900)}`, // keep it short
          });
        }
      } else {
        await axios.post(`${TELEGRAM_API}/sendMessage`, {
          chat_id: chatId,
          text: `${edContent}`, // keep it short
        });
      }

    }
    } else if (message === "http://") {
      await axios.get(message); // will likely fail, but mimics your original condition
    } else {
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: `Hi ${firstName}, Kindly add a URL to parse. We scrape and get the body data.`,
      });
    }

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Endpoint to set up webhook
app.get("/setup-webhook", async (req, res) => {
  try {
    const webhookUrl = `https://telegram-bot-cki3.onrender.com/webhook`;
    console.log("Webhook URL:", webhookUrl);
    console.log("Telegram Bot Token:", TELEGRAM_BOT_TOKEN); // For debug

    const response = await axios.post(`${TELEGRAM_API}/setWebhook`, {
      url: webhookUrl
    });

    res.json({
      success: true,
      webhookUrl,
      telegramResponse: response.data
    });
  } catch (error) {
    console.error("Error setting webhook:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
});

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ status: "Bot is running", timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
