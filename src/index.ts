import * as dotenv from "dotenv";
import express, { Express } from "express";
import chatbotRoutes from "./infra/router/chatbot.routes";

async function bootstrap() {
  const app: Express = express();
  const port = process.env.PORT || 3000;

  dotenv.config();

  app.use(express.json());

  app.get("/", (req, res) => {
    res.send(
      "Olá, está é uma API destinada a buscar informações sobre filmes!"
    );
  });

  app.use("/chatbot", chatbotRoutes);

  app.listen(port, async () => {
    console.log("listening on port " + port);
  });
}

bootstrap();
