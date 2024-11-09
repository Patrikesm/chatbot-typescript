import axios from "axios";
import { IMovieGateway } from "../ports/IMovieGateway";

export class MovieGateway implements IMovieGateway {
  async getCasting() {}

  async getMovieSynopsis(movieName: string): Promise<string> {
    console.log(process.env.MOVIE_API_URL);
    console.log(movieName);
    const response = await axios.get(
      `${process.env.MOVIE_API_URL}/search/movie?api_key=d0d17cbea03e1e751061b001e857b4fb&language=pt-BR&query=${movieName}`
    );

    return response.data.results;
  }

  getMovieRating() {}

  getPopularMovies() {}

  getGenreRecomendations() {}

  getSimilarMovies() {}
}
