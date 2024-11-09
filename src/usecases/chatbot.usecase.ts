import natural, { AggressiveTokenizer, WordTokenizer } from "natural";
import { removeAccents, removeAccentsAndPoint } from "./tools";
import { IMovieGateway } from "../infra/ports/IMovieGateway";
import { MovieGateway } from "../infra/gateway/MovieGateway";
import { dialogMap } from "./tools/dialogMap";

const JARO_DISTANCE: number = 0.8;
const JARO_MEANING_DISTANCE: number = 0.7;

export class ChatbotUseCase {
  private movieGateway: IMovieGateway;
  private tokenizer: AggressiveTokenizer;

  constructor() {
    this.movieGateway = new MovieGateway();
    this.tokenizer = new natural.AggressiveTokenizer();
  }

  private async verifyMovieNameOrGenre(message: string): Promise<string> {
    return (
      message
        .match(/(['"])([^'"]*)\1/g)
        ?.toString()
        .replace(/'/g, "") || ""
    ); //todo verificar se tem mais de um nome
  }

  private tokenizeMessage(message: string): string[] {
    const messageWithouAccents = removeAccents(message.toLowerCase());
    const tokenizedMessage = this.tokenizer.tokenize(messageWithouAccents);
    return tokenizedMessage.filter((token) => token.length >= 4);
  }

  private intentionIdentifier(tokenizedMessage: string[]) {
    const intentions = ["elenco", "sinopse"];

    const foundedIntentions: Set<string> = new Set([]);
    const possibleIntentions: Set<string> = new Set([]);

    tokenizedMessage.forEach((token) => {
      for (const intention of intentions) {
        const jaroDistance = natural.JaroWinklerDistance(intention, token);

        if (token === intention || jaroDistance >= JARO_DISTANCE) {
          foundedIntentions.add(intention);
          continue;
        } else if (jaroDistance >= JARO_MEANING_DISTANCE) {
          possibleIntentions.add(intention);
        }
      }
    });

    return { foundedIntentions, possibleIntentions };
  }

  private getBestMovieResult(movieName: string, results: any[]) {
    const movieNameTokenized = this.tokenizer.tokenize(
      movieName.toLowerCase().replace(/'/g, "")
    );
    let bestResult: any;
    let bestDistance: number = 0;

    results.forEach((movie) => {
      let distance: number = 0;
      const tokenizedMovie = this.tokenizer.tokenize(movie.title.toLowerCase());

      for (let i = 0; i < tokenizedMovie.length; i++) {
        if (movieNameTokenized.includes(tokenizedMovie[i])) {
          continue;
        }

        distance++;
      }

      if (!bestResult || distance < bestDistance) {
        (bestDistance = distance), (bestResult = movie);
      }
    });

    return bestResult;
  }

  async readMessage(message: string): Promise<string> {
    let responseMessage: string = "";
    const movieOrGenre = await this.verifyMovieNameOrGenre(message);
    const tokenizedMessage = this.tokenizeMessage(message);

    const { foundedIntentions, possibleIntentions } =
      this.intentionIdentifier(tokenizedMessage);

    if (foundedIntentions.size === 0 && possibleIntentions.size > 0) {
      return dialogMap.not_found.possibleActions.replace(
        "{{intentions}}",
        `'${Array.from(possibleIntentions).join(", ")}'`
      );
    } // todo ver a saida caso não tenha nenhum

    for (const intention of foundedIntentions) {
      console.log(intention);
      switch (intention) {
        case "elenco":
          console.log("entrei no elenco");
          if (!movieOrGenre) return dialogMap.not_found.movieName;
          responseMessage += dialogMap.message_options.casting.replace(
            "{{cast}}",
            await this.movieCasting(movieOrGenre)
          );

          break;
        case "sinopse":
          console.log("entrei na sinopse");
          if (!movieOrGenre) return dialogMap.not_found.movieName;

          console.log(responseMessage);
          responseMessage += dialogMap.message_options.synopsis.replace(
            "{{synopsis}}",
            await this.movieSynopsis(movieOrGenre)
          );

          break;
        // case tokenizedMessage.includes("avaliacao"):
        //   if (!movieOrGenre) return dialogMap.not_found.movieName;
        //   responseMessage.concat(await this.movieRating(movieOrGenre));

        // case tokenizedMessage.includes("populares"):
        //   responseMessage.concat(await this.popularMovies());

        // case tokenizedMessage.includes("recomendacao"):
        //   if (!movieOrGenre) return dialogMap.not_found.genreName;
        //   responseMessage.concat(await this.movieRecomendation(movieOrGenre));

        // case tokenizedMessage.includes("similar"):
        //   if (!movieOrGenre) return dialogMap.not_found.movieName;
        //   responseMessage.concat(await this.similarMovie(movieOrGenre));
      }
    }

    console.log(responseMessage);

    return responseMessage;
  }

  async movieCasting(movieName: string): Promise<string> {
    const response = await this.movieGateway.getMovieByName(movieName);
    const bestResult = await this.getBestMovieResult(movieName, response);

    const movieInfo = await this.movieGateway.getCasting(
      bestResult.id?.toString()
    );

    const casting = movieInfo.map((casting: any) => {
      return `${casting.name} como ${casting.character}`;
    });

    return casting.join(", ");
  }

  async movieSynopsis(movieName: string): Promise<string> {
    const response = await this.movieGateway.getMovieSynopsis(movieName);
    const bestResult = await this.getBestMovieResult(movieName, response);

    return bestResult.overview;
  }

  async movieRating(movieName: string): Promise<string> {
    const response = await this.movieGateway.getMovieByName(movieName);
    const bestResult = await this.getBestMovieResult(movieName, response);

    return bestResult.vote_average.toString();
  }

  async popularMovies(): Promise<string> {
    const response = await this.movieGateway.getPopularMovies();

    return response;
  }

  async movieRecomendation(genre: string): Promise<string> {
    const genres = await this.movieGateway.getGenres();

    const response = await this.movieGateway.getMoviesByGenre(genres[0].id);
    return response;
  }

  async similarMovie(movieName: string): Promise<string> {
    const movies = await this.movieGateway.getMovieByName(movieName);
    const bestResult = await this.getBestMovieResult(movieName, movies);

    const response = await this.movieGateway.getSimilarMovies(bestResult.id);

    return response;
  }
}
