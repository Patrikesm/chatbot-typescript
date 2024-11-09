import { Router, Request, Response } from "express";
import { ChatbotUseCase } from "../../usecases/chatbot.usecase";
import { ChatbotResponseDto } from "../dtos/chatbotDto";
import { isObjectEmpty } from "../../usecases/tools";

class ChatbotRoutes {
  private chatbotUseCase: ChatbotUseCase;
  chatbotRouter: Router;

  constructor() {
    this.chatbotUseCase = new ChatbotUseCase();
    this.chatbotRouter = Router();
    this.init();
  }

  // implementar o zod

  init() {
    this.chatbotRouter.post(
      "/",
      async (req: Request, res: Response<ChatbotResponseDto>) => {
        const body = req.body;

        if (!body || isObjectEmpty(body)) {
          res.send({
            message:
              "Desculpe não consegui entender, parece que sua mensagem está vazia",
          });
        }

        const response = await this.chatbotUseCase.readMessage(body?.message);

        res.send({
          message: response,
        });
      }
    );
  }
}

export default new ChatbotRoutes().chatbotRouter;
