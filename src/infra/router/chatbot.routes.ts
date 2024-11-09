import { Router } from "express";
import { ChatbotUseCase } from "../../usecases/chatbot.usecase";

class ChatbotRoutes {
  private chatbotUseCase: ChatbotUseCase;
  chatbotRouter: Router;

  constructor() {
    this.chatbotUseCase = new ChatbotUseCase();
    this.chatbotRouter = Router();
    this.init();
  }

  init() {
    this.chatbotRouter.post("/", async (req, res) => {
      const body = req.body;

      const response = await this.chatbotUseCase.readMessage(body.message);

      res.send(response);
    });
  }
}

export default new ChatbotRoutes().chatbotRouter;
