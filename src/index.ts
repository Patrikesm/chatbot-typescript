import * as dotenv from "dotenv";
import express, { Express } from "express";
import chatbotRoutes from "./infra/router/chatbot.routes";

async function bootstrap() {
  const app: Express = express();
  const port = process.env.PORT || 3000;

  dotenv.config();

  app.use(express.json());

  app.get("/", (req, res) => {
    console.log(process.env.MOVIE_API_URL);
    res.send("Hello World!");
  });

  app.use("/chatbot", chatbotRoutes);

  app.listen(port, async () => {
    console.log("listening on port " + port);
  });
}

bootstrap();
