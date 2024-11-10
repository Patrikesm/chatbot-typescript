import natural, { AggressiveTokenizer, WordTokenizer } from "natural";
import { removeAccents, removeAccentsAndPoint } from "./tools";
import { IMovieGateway } from "../infra/ports/IMovieGateway";
import { MovieGateway } from "../infra/gateway/MovieGateway";
import { dialogMap } from "./tools/dialogMap";
import { ChatbotResponseDto } from "../infra/dtos/chatbotDto";

const JARO_DISTANCE: number = 0.8;
const JARO_MEANING_DISTANCE: number = 0.7;

enum Intentions {
  Casting = "elenco",
  Synopsis = "sinopse",
  Rating = "avaliacao",
  Popular = "populares",
  Recomendation = "recomendacao",
  Similiar = "similar",
}

export class ChatbotUseCase {
  private movieGateway: IMovieGateway;
  private tokenizer: AggressiveTokenizer;
  private intentions: Intentions[] = [
    Intentions.Casting,
    Intentions.Synopsis,
    Intentions.Rating,
    Intentions.Popular,
    Intentions.Recomendation,
    Intentions.Similiar,
  ];

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
    );
  }

  private tokenizeMessage(message: string): string[] {
    const messageWithouAccents = removeAccents(message.toLowerCase());
    const tokenizedMessage = this.tokenizer.tokenize(messageWithouAccents);
    return tokenizedMessage.filter((token) => token.length >= 4);
  }

  private intentionIdentifier(tokenizedMessage: string[]) {
    const foundedIntentions = new Set<string>();
    const possibleIntentions = new Set<string>();

    tokenizedMessage.forEach((token) => {
      for (const intention of this.intentions) {
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
      const tokenizedMovie = this.tokenizer.tokenize(
        removeAccents(movie.title.toLowerCase())
      );

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

  async readMessage(message: string): Promise<Partial<ChatbotResponseDto>> {
    let responseMessage: ChatbotResponseDto = {} as ChatbotResponseDto;
    const movieOrGenre = await this.verifyMovieNameOrGenre(message);
    const tokenizedMessage = this.tokenizeMessage(message);

    const { foundedIntentions, possibleIntentions } =
      this.intentionIdentifier(tokenizedMessage);

    if (foundedIntentions.size === 0) {
      if (possibleIntentions.size > 0) {
        return {
          message: dialogMap.not_found.possibleActions.replace(
            "{{intentions}}",
            `'${Array.from(possibleIntentions).join(", ")}'`
          ),
        };
      }

      return { message: dialogMap.not_found.action };
    }

    responseMessage.message = dialogMap.message_options.default.replace(
      "{{movie}}",
      movieOrGenre
    );

    for (const intention of foundedIntentions) {
      switch (intention) {
        case Intentions.Casting:
          if (!movieOrGenre) return { message: dialogMap.not_found.movieName };
          responseMessage.casting = await this.movieCasting(movieOrGenre);
          break;

        case Intentions.Synopsis:
          if (!movieOrGenre) return { message: dialogMap.not_found.movieName };
          responseMessage.synopsis = await this.movieSynopsis(movieOrGenre);
          break;

        case Intentions.Rating:
          if (!movieOrGenre) return { message: dialogMap.not_found.movieName };

          responseMessage.rating = dialogMap.message_options.rating.replace(
            "{{rating}}",
            await this.movieRating(movieOrGenre)
          );
          break;

        case Intentions.Popular:
          if (Object.keys(responseMessage).length > 1) break;
          responseMessage.message = dialogMap.message_options.popular;
          responseMessage.popularMovies = await this.popularMovies();

          return responseMessage;

        case Intentions.Recomendation:
          if (Object.keys(responseMessage).length > 1) break;
          if (!movieOrGenre) return { message: dialogMap.not_found.genreName };

          const { recomendation, validGenres } = await this.movieRecomendation(
            movieOrGenre
          );

          if (!recomendation || recomendation.length === 0) {
            return {
              message: dialogMap.not_found.genreMovies.replace(
                "{{genres}}",
                validGenres.join("")
              ),
            };
          }
          responseMessage.message =
            dialogMap.message_options.recomendation.replace(
              "{{genre}}",
              movieOrGenre
            );
          responseMessage.recomendation = recomendation;
          break;

        case Intentions.Similiar:
          if (!movieOrGenre) return { message: dialogMap.not_found.movieName };
          responseMessage.similar = await this.similarMovie(movieOrGenre);
          break;
        default:
          return { message: dialogMap.not_found.action };
      }
    }

    return responseMessage;
  }

  async movieCasting(movieName: string): Promise<string[]> {
    const response = await this.movieGateway.getMovieByName(movieName);
    const bestResult = await this.getBestMovieResult(movieName, response);

    const movieInfo = await this.movieGateway.getCasting(
      bestResult.id?.toString()
    );

    const casting = movieInfo.map((casting: any) => {
      return `${casting.name} como ${casting.character}`;
    });

    return casting;
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

  async popularMovies(): Promise<any> {
    const response = await this.movieGateway.getPopularMovies();

    const populaMovies = response.map((movie: any) => {
      return {
        title: movie.title,
        averageRating: movie.vote_average,
        synopsis: movie.overview,
      };
    });

    return populaMovies;
  }

  async movieRecomendation(genre: string): Promise<any> {
    let validGenres: string[] = [];
    let possibleGenre: any;
    const genres = await this.movieGateway.getGenres();

    genres.forEach((foundGenre: any) => {
      validGenres.push(
        validGenres.length < genres.length - 1
          ? `${foundGenre.name}, `
          : `${foundGenre.name}.`
      );

      if (
        removeAccents(foundGenre.name.toLowerCase()) ===
        removeAccents(genre.toLowerCase())
      ) {
        possibleGenre = foundGenre;
      }
    });

    if (possibleGenre) {
      const response = await this.movieGateway.getMoviesByGenre(
        possibleGenre.id
      );

      const recomendation = response.map((movie: any) => {
        return {
          title: movie.title,
          averageRating: movie.vote_average,
          synopsis: movie.overview,
        };
      });

      return { recomendation, validGenres };
    }

    return { possibleGenre, validGenres };
  }

  async similarMovie(movieName: string): Promise<string[]> {
    const movies = await this.movieGateway.getMovieByName(movieName);
    const bestResult = await this.getBestMovieResult(movieName, movies);

    const response = await this.movieGateway.getSimilarMovies(bestResult.id);

    const similarMovies = response.map((movie: any) => {
      return `${movie.title} nota ${movie.vote_average}`;
    });

    return similarMovies;
  }
}

// todo
// validação de resposta vazia
// validação de entrada da mensagem
// ajustar o body de retorno
// verificar se tem mais de um nome de filme
// todo ver a saida caso não tenha nenhum
// abstrair o get do filme, pode ser uma vez só
// ver aonde eu adiciono a mensagem principal
// formatar corretamente a mensagem
// ajustar url
// fazer um enum com as intenções
// ajustar dto
