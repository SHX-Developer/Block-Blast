import { Bot, GrammyError, HttpError } from "grammy";
import { initDb, recordUser } from "./db.js";

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEB_APP_URL = process.env.WEB_APP_URL;

if (!BOT_TOKEN) {
  console.error("BOT_TOKEN env required");
  process.exit(1);
}
if (!WEB_APP_URL) {
  console.error("WEB_APP_URL env required");
  process.exit(1);
}

const bot = new Bot(BOT_TOKEN);

bot.command("start", async (ctx) => {
  if (ctx.from) {
    try {
      await recordUser(ctx.from);
    } catch (err) {
      console.error("[start] recordUser failed:", err);
    }
  }

  const name = ctx.from?.first_name ?? "друг";

  await ctx.reply(
    `👋 Привет, ${name}!\n\n` +
      `🧩 Block Blast — собирай линии, ставь рекорды!\n` +
      `Жми кнопку ниже и начинай игру 🚀`,
    {
      reply_markup: {
        inline_keyboard: [[{ text: "🎮 Играть", web_app: { url: WEB_APP_URL } }]],
      },
    },
  );
});

bot.catch((err) => {
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("[bot] Telegram error:", e.description);
  } else if (e instanceof HttpError) {
    console.error("[bot] network error:", e);
  } else {
    console.error("[bot] unknown error:", e);
  }
});

async function main() {
  await initDb();

  process.once("SIGINT", () => bot.stop());
  process.once("SIGTERM", () => bot.stop());

  console.log("[bot] starting…");
  await bot.start({
    onStart: (me) => console.log(`[bot] @${me.username} online`),
  });
}

main().catch((err) => {
  console.error("[bot] fatal:", err);
  process.exit(1);
});
