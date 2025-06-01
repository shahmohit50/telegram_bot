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
    if (message.includes("https://goo")) {
      const scraped = await axios.get(message, {
        headers: {
          Accept: "application/rss+xml",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/136.0.0.0 Safari/537.36",
        },
      });

      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: `Scraped content:\n\n${scraped.data.substring(0, 1000)}`, // keep it short
      });
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
    const webhookUrl = `${req.protocol}://${req.get('host')}/webhook`;
    const response = await axios.post(`${TELEGRAM_API}/setWebhook`, {
      url: webhookUrl
    });
    res.json({ 
      success: true, 
      webhookUrl,
      telegramResponse: response.data 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ status: "Bot is running", timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
