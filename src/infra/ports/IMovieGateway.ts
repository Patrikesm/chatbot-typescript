export interface IMovieGateway {
  getCasting(movieName: string): any;
  getMovieSynopsis(movieName: string): Promise<any>;
  getPopularMovies(): any;
  getMoviesByGenre(genre: string): any;
  getSimilarMovies(movieId: string): any;

  getMovieByName(movieName: string): any;
  getGenres(): any;
}
