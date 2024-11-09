export interface IMovieGateway {
  getCasting(): any;
  getMovieSynopsis(movieName: string): Promise<any>;
  getMovieRating(): any;
  getPopularMovies(): any;
  getGenreRecomendations(): any;
  getSimilarMovies(): any;
}
