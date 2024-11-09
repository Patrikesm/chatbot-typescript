import natural, { WordTokenizer } from "natural";
import { removeAccents, removeAccentsAndPoint } from "./tools";
import { IMovieGateway } from "../infra/ports/IMovieGateway";
import { MovieGateway } from "../infra/gateway/MovieGateway";

export class ChatbotUseCase {
  //   private tokenizer: WordTokenizer;
  private movieGateway: IMovieGateway;

  constructor() {
    this.movieGateway = new MovieGateway();
  }

  async readMessage(message: string): Promise<string> {
    const movieName = message.match(/(['"])([^'"]*)\1/g)?.toString();

    if (!movieName) {
      return "Desculpe não pude identificar nenhum nome de filme em sua pergunta, pode tentar novamente?";
    }

    console.log(movieName);

    const messageWithouAccents = removeAccents(message.toLowerCase());

    const tokenizer = new natural.AggressiveTokenizerPt();
    const tokenizedMessage = tokenizer.tokenize(messageWithouAccents);

    switch (true) {
      case tokenizedMessage.includes("elenco"):
        return this.sinopseFunction("elenco");
      case tokenizedMessage.includes("sinopse"):
        return this.sinopseFunction(movieName);
      case tokenizedMessage.includes("avaliacao"):
        return this.sinopseFunction("avaliacao");
      case tokenizedMessage.includes("populares"):
        return this.sinopseFunction("populares");
      case tokenizedMessage.includes("recomendacao"):
        return this.sinopseFunction("recomendacao");
      case tokenizedMessage.includes("similar"):
        return await this.sinopseFunction("similar");
      default:
        break;
    }

    return "Desculpe não entendi sua mensagem, pode tentar novamente ?";
  }

  async sinopseFunction(movieName: string): Promise<string> {
    const response = await this.movieGateway.getMovieSynopsis(movieName);

    const movies = response.map((movie: any) => {
      const tokenizer = new natural.AggressiveTokenizerPt();
      const tokenizedMessage = tokenizer.tokenize(movie.title);

      return { [tokenizedMessage.join(" ")]: movie };
    });

    return movies[0];
  }
}
