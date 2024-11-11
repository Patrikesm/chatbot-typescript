import natural, { AggressiveTokenizer, WordTokenizer } from "natural";
import { removeAccents } from "./tools";
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
        .replace(/[^a-zA-Z0-9\s]/g, "") || ""
    );
  }

  private tokenizeMessage(message: string): string[] {
    const tokenizedMessage = this.tokenizer.tokenize(message);
    return tokenizedMessage.filter((token) => token.length >= 4);
  }

  private intentionIdentifier(tokenizedMessage: string[]) {
    const foundIntentions = new Set<string>();
    const possibleIntentions = new Set<string>();

    tokenizedMessage.forEach((token) => {
      for (const intention of this.intentions) {
        const jaroDistance = natural.JaroWinklerDistance(intention, token);

        if (token === intention || jaroDistance >= JARO_DISTANCE) {
          foundIntentions.add(intention);
          continue;
        } else if (jaroDistance >= JARO_MEANING_DISTANCE) {
          possibleIntentions.add(intention);
        }
      }
    });

    return { foundIntentions, possibleIntentions };
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

  private async getMovieByTitle(movieTitle: string): Promise<any> {
    const response = await this.movieGateway.getMovieByName(movieTitle);
    const bestResult = await this.getBestMovieResult(movieTitle, response);

    return bestResult;
  }

  private async findPossibleGenre(genre: string): Promise<any> {
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
        removeAccents(foundGenre.name.toLowerCase()) === genre.toLowerCase()
      ) {
        possibleGenre = foundGenre;
      }
    });

    return { possibleGenre, validGenres };
  }

  async readMessage(message: string): Promise<Partial<ChatbotResponseDto>> {
    let responseMessage: ChatbotResponseDto = {} as ChatbotResponseDto;
    const movieOrGenre = await this.verifyMovieNameOrGenre(message);
    const tokenizedMessage = this.tokenizeMessage(message);

    const { foundIntentions, possibleIntentions } =
      this.intentionIdentifier(tokenizedMessage);

    if (foundIntentions.size === 0) {
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

    const intentions = Array.from(foundIntentions);

    if (intentions[0] == Intentions.Recomendation) {
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
      responseMessage.message = dialogMap.message_options.recomendation.replace(
        "{{genre}}",
        movieOrGenre
      );
      responseMessage.recomendation = recomendation;
      return responseMessage;
    } else if (intentions[0] == Intentions.Popular) {
      responseMessage.message = dialogMap.message_options.popular;
      responseMessage.popularMovies = await this.popularMovies();

      return responseMessage;
    }

    if (!movieOrGenre) return { message: dialogMap.not_found.movieName };

    const foundMovie = await this.getMovieByTitle(movieOrGenre);

    if (!foundMovie) {
      return {
        message: dialogMap.not_found.movie.replace("{{movie}}", movieOrGenre),
      };
    }

    responseMessage.message = dialogMap.message_options.default.replace(
      "{{movie}}",
      foundMovie.title
    );

    for (const intention of intentions) {
      switch (intention) {
        case Intentions.Casting:
          responseMessage.casting = await this.movieCasting(
            foundMovie.id.toString()
          );
          break;

        case Intentions.Synopsis:
          responseMessage.synopsis = foundMovie.overview;
          break;

        case Intentions.Rating:
          responseMessage.rating = dialogMap.message_options.rating.replace(
            "{{rating}}",
            await foundMovie.vote_average
          );
          break;

        case Intentions.Similiar:
          responseMessage.similar = await this.similarMovie(
            foundMovie.id.toString()
          );
          break;
      }
    }

    return responseMessage;
  }

  async movieCasting(movieId: string): Promise<string[]> {
    const movieInfo = await this.movieGateway.getCasting(movieId);

    const casting = movieInfo.map((casting: any) => {
      return `${casting.name} como ${casting.character}`;
    });

    return casting;
  }

  async movieSynopsis(movieName: string): Promise<string> {
    // colocar o guardRails aqui
    return "";
  }

  async similarMovie(movieId: string): Promise<string[]> {
    const response = await this.movieGateway.getSimilarMovies(movieId);

    const similarMovies = response.map((movie: any) => {
      return `${movie.title} nota ${movie.vote_average}`;
    });

    return similarMovies;
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
    const { possibleGenre, validGenres } = await this.findPossibleGenre(genre);

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
}
