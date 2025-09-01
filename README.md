🤖 Bot Ranked - Discord

Um bot de ranked automatizado para Discord, criado para organizar partidas 4v4 de forma rápida, justa e divertida.

🚀 Funcionalidades

🎲 Comando /roll para sortear os times automaticamente.

📢 Criação de canais de voz temporários para cada time (time 1 e time 2).

🔄 Movimentação automática dos jogadores para os canais corretos.

🏆 Comando /endgame para registrar resultados da partida.

📊 Histórico de jogos e sistema de ranking.

🔒 Canais e partidas são excluídos automaticamente quando ficam vazios.

🛠️ Tecnologias utilizadas

Node.js

Discord.js v14

Banco de dados via arquivos .json (com opção de evolução futura para SQL/NoSQL).

📂 Estrutura do projeto
/commands      -> Comandos do bot (/roll, /endgame, etc.)
/utils         -> Configurações, bancos de dados e helpers
index.js       -> Arquivo principal

📦 Como rodar o projeto

Clone este repositório:

git clone https://github.com/seu-usuario/nome-do-repo.git
cd nome-do-repo


Instale as dependências:

npm install


Configure seu config.json dentro da pasta utils com o token do bot e outras infos.

Inicie o bot:

node index.js

👨‍💻 Autor

Bot desenvolvido por Marlon (M7zy) com auxílio do ChatGPT (OpenAI).

📜 Licença

Este projeto está sob a licença MIT.
