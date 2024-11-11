export type ChatbotResponseDto = {
  message: string;
  casting: string[];
  synopsis: string;
  rating: string;
  popularMovies: Object[];
  recomendation: Object[];
  similar: string[];
};
