import axios from "axios";
import { IMovieGateway } from "../ports/IMovieGateway";

export class MovieGateway implements IMovieGateway {
  private readonly baseUrl: string;
  private readonly apiToken: string;

  constructor() {
    this.baseUrl = process.env.MOVIE_API_URL || "";
    this.apiToken = process.env.MOVIE_API_TOKEN || "";
  }

  async getGenres(): Promise<any> {
    const response = await axios.get(
      `${this.baseUrl}/genre/movie/list?api_key=${this.apiToken}&language=pt-BR`
    );

    return response.data.genres; //todo fazer um map aqui
  }

  async getMovieByName(movieName: string): Promise<any> {
    const response = await axios.get(
      `${this.baseUrl}/search/movie?api_key=${this.apiToken}&include_adult=false&language=pt-BR&query=${movieName}`
    );

    return response.data.results;
  }

  async getCasting(movieId: string): Promise<any> {
    const response = await axios.get(
      `${this.baseUrl}/movie/${movieId}?api_key=${this.apiToken}&include_adult=false&language=pt-BR&append_to_response=credits`
    );

    return response.data.credits?.cast;
  }

  async getMovieSynopsis(movieName: string): Promise<string> {
    return await this.getMovieByName(movieName);
  }

  async getPopularMovies() {
    const response = await axios.get(
      `${this.baseUrl}/movie/top_rated?api_key=${this.apiToken}&include_adult=false&language=pt-BR`
    );

    return response.data.results;
  }

  async getMoviesByGenre(genreId: string): Promise<any> {
    const response = await axios.get(
      `${this.baseUrl}/discover/movie?api_key=${this.apiToken}&include_adult=false&language=pt-BR&with_genres=${genreId}`
    );

    return response.data.results;
  }

  async getSimilarMovies(movieId: string): Promise<any> {
    const response = await axios.get(
      `${this.baseUrl}/movie/${movieId}/similar?api_key=${this.apiToken}&include_adult=false&language=pt-BR`
    );

    return response.data;
  }
}
