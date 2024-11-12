import { Router, Request, Response } from "express";
import { ChatbotUseCase } from "../../usecases/chatbot.usecase";
import { ChatbotResponseDto } from "../dtos/chatbotDto";
import { isObjectEmpty, removeAccents } from "../../usecases/tools";

class ChatbotRoutes {
  private chatbotUseCase: ChatbotUseCase;
  chatbotRouter: Router;

  constructor() {
    this.chatbotUseCase = new ChatbotUseCase();
    this.chatbotRouter = Router();
    this.init();
  }

  init() {
    this.chatbotRouter.post(
      "/",
      async (req: Request, res: Response<Partial<ChatbotResponseDto>>) => {
        const body = req.body;
        if (
          !body ||
          isObjectEmpty(body) ||
          !body.message ||
          body.message.trim() === ""
        ) {
          res.send({
            message:
              "Desculpe não consegui entender, parece que sua mensagem está vazia, tente enviar uma mensagem com o formato: {message: 'Pergunta'} ",
          });
        }
        const response = await this.chatbotUseCase.readMessage(
          removeAccents(body?.message).toLowerCase()
        );

        res.send(response);
      }
    );
  }
}

export default new ChatbotRoutes().chatbotRouter;
