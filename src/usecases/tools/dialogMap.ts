export const dialogMap = {
  not_found: {
    action:
      "Desculpe não entendi sua mensagem, pode tentar novamente? Posso responder perguntas como: Qual a sinopse do filme 'Deadpool', Qual elenco do filme 'O poderoso chefão' e não esqueça de utilizar aspas simples pra eu saber de que filme ou gênero estamos falando",
    movieName:
      "Desculpe não pude identificar nenhum nome de filme em sua pergunta, pode tentar novamente? lembre-se de usar aspas simples para identificar o filme",
    movie:
      "Desculpe não consegui encontrar nenhum filme chamado {{movie}}, pode tentar novamente? lembre-se de usar aspas simples para identificar o filme",
    genreName:
      "Desculpe não pude identificar nenhum gênero filme em sua pergunta, pode tentar novamente? lembre-se de usar aspas simples para identificar o gênero",
    genreMovies:
      "Desculpe não pude identificar nenhum filme com esse gênero, pode tentar novamente? Aqui uma lista de gêneros que consigo procurar {{genres}}",
    possibleActions:
      "Desculpe não pude identificar nenhuma ação, você quis dizer {{intentions}}",
  },
  message_options: {
    default: "Claro, aqui segue as informações do filme '{{movie}}'",
    rating: "A Avaliação do filme é: {{rating}}",
    popular: "Segue uma listagem de filmes melhores avaliados",
    recomendation:
      "Listagem de recomendações de filmes com base no gênero {{genre}}",
  },
};
