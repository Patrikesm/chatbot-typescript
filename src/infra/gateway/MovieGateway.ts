import axios from "axios";
import { IMovieGateway } from "../ports/IMovieGateway";

export class MovieGateway implements IMovieGateway {
  private readonly baseUrl: string;
  private readonly apiToken: string;
  private readonly params: string;

  constructor() {
    this.baseUrl = process.env.MOVIE_API_URL || "";
    this.apiToken = process.env.MOVIE_API_TOKEN || "";
    this.params = `api_key=${this.apiToken}&include_adult=false&language=pt-BR`;
  }

  async getGenres(): Promise<any> {
    const response = await axios.get(
      `${this.baseUrl}/genre/movie/list?api_key=${this.apiToken}&language=pt-BR`
    );

    return response.data.genres;
  }

  async getMovieByName(movieName: string): Promise<any> {
    const response = await axios.get(
      `${this.baseUrl}/search/movie?${this.params}&query=${movieName}`
    );

    return response.data.results;
  }

  async getCasting(movieId: string): Promise<any> {
    const response = await axios.get(
      `${this.baseUrl}/movie/${movieId}?${this.params}&append_to_response=credits`
    );

    return response.data.credits?.cast;
  }

  async getMovieSynopsis(movieName: string): Promise<string> {
    return await this.getMovieByName(movieName);
  }

  async getPopularMovies() {
    const response = await axios.get(
      `${this.baseUrl}/movie/popular?${this.params}`
    );

    return response.data.results;
  }

  async getMoviesByGenre(genreId: string): Promise<any> {
    const response = await axios.get(
      `${this.baseUrl}/discover/movie?${this.params}&with_genres=${genreId}`
    );

    return response.data.results;
  }

  async getSimilarMovies(movieId: string): Promise<any> {
    const response = await axios.get(
      `${this.baseUrl}/movie/${movieId}/similar?${this.params}`
    );

    return response.data.results;
  }
}
