import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

const API_KEY = "MASUKKAN_API_KEY";
const LIVE_CHAT_ID = "MASUKKAN_LIVE_CHAT_ID";

let commandQueue = [];

// Ambil chat dari YouTube setiap 2 detik
async function fetchChat() {
  try {
    const res = await axios.get(
      "https://www.googleapis.com/youtube/v3/liveChatMessages",
      {
        params: {
          liveChatId: LIVE_CHAT_ID,
          part: "snippet,authorDetails",
          key: API_KEY,
        },
      }
    );

    res.data.items.forEach((msg) => {
      const text = msg.snippet.textMessageDetails?.messageText;
      const user = msg.authorDetails.displayName;

      if (!text) return;

      console.log(`[CHAT] ${user}: ${text}`);

      // Masukkan ke queue
      commandQueue.push({
        user,
        message: text.toLowerCase(),
      });
    });
  } catch (e) {
    console.log("Gagal mengambil chat:", e.message);
  }
}

setInterval(fetchChat, 2000);

// Endpoint yang diambil Roblox
app.get("/commands", (req, res) => {
  const data = [...commandQueue];
  commandQueue = []; // kosongkan setelah diambil Roblox
  res.json(data);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server berjalan di port", PORT);
});
