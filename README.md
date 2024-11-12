O projeto ainda está em desenvolvimento e as próximas atualizações serão voltadas para as seguintes tarefas:

- [ ] Implementar OLlama para filtrar perguntas e respostass
- [ ] Utilizar IA para traduzir textos e identificar respostas que não fazem sentido com as perguntas

## 💻 Pré-requisitos

Para iniciar o projeto certifique de seguir os seguintes passos: 

- Criar um arquivo .env com base no .env.example;
- inserir o token da API api.themoviedb.org.


## 🚀 Instalando

Para instalar o projeto, siga estas etapas:

- Executar comando "npm install";
- Para iniciar utilize o comando npm run start.

## 📫 Utilização

O Projeto possui uma rota de utilização chamada "/chatbot" que utiliza o método post e recebe um JSON no seguinte formato

{ "message": "Pergunta" }

Nela será possível realizar as seguintes perguntas 

- “Qual é o elenco do filme ‘Nome do Filme’?”
- “Qual é a sinopse do filme ‘Nome do Filme’?”
- “Qual é a avaliação do filme ‘Nome do Filme’?”
- “Quais são os filmes populares no momento?”
- “Dê-me uma recomendação de filme com base no meu gosto por ‘Gênero’.”
- “Quero um filme similar ao 'Nome do FIlme'"

Algumas perguntas podem ser mescladas, como sinopse, elenco e avaliação. 
Além disso a API retorna sugestões de perguntas e possui ums certa tolêrancia de proximidade das palavras, permitindo buscar um resultado mesmo com palavras escritas de forma incorreta
