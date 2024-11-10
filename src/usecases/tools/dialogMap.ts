export const dialogMap = {
  not_found: {
    action:
      "Desculpe não entendi sua mensagem, pode tentar novamente? Posso responder perguntas como: Qual a sinopse do filme 'Deadpool', Qual elenco do filme 'O poderoso chefão' e não esqueça de utilizar aspas simples pra eu saber de que filme ou genero estamos falando",
    movieName:
      "Desculpe não pude identificar nenhum nome de filme em sua pergunta, pode tentar novamente?",
    genreName:
      "Desculpe não pude identificar nenhum genero filme em sua pergunta, pode tentar novamente?",
    genreMovies:
      "Desculpe não pude identificar nenhum filme com esse genero, pode tentar novamente? Aqui uma lista de generos que consigo procurar {{genres}}",
    possibleActions:
      "Desculpe não pude identificar nenhuma ação, você quis dizer {{intentions}}",
  },
  message_options: {
    default: "Claro, aqui segue as informações do filme '{{movie}}'",
    rating: "A Avaliação do filme é: {{rating}}",
    popular: "Segue uma listagem de filmes melhores avaliados",
    recomendation:
      "Listagem de recomendações de filmes com base no genero {{genre}}",
  },
};
