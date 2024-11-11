export interface IMovieGateway {
  getCasting(movieName: string): any;
  getMovieSynopsis(movieName: string): Promise<any>;
  getPopularMovies(genre?: string): any;
  getMoviesByGenre(genre: string): any;
  getSimilarMovies(movieId: string): any;

  getMovieByName(movieName: string): any;
  getGenres(): any;
}
