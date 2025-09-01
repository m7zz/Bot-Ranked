const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("piada")
    .setDescription("Fala uma piada aleatória"),

  async execute(interaction) {
    // Array com 30 piadas
    const piadas = [
      "Por que o livro de matemática se suicidou? Porque estava cheio de problemas.",
      "O que o zero disse para o oito? Belo cinto!",
      "Por que o computador foi ao médico? Porque estava com um vírus.",
      "Qual é o contrário de 'nove'? 'Novo'!",
      "Sabe qual é o animal mais antigo? A zebra, porque ela está em preto e branco.",
      "O que é o cúmulo da rapidez? Correr atrás do tempo perdido!",
      "Você sabe qual é o cúmulo da paciência? Esperar a internet cair para ver se volta.",
      "Por que a vaca foi para o espaço? Para se encontrar com a via-láctea.",
      "Como o oceano se diz quando está bravo? 'Eu estou sem mar'!",
      "Qual é o animal que é bom de matemática? O octágono.",
      "Por que o coelho atravessou a estrada? Porque ele queria chegar do outro lado!",
      "O que acontece quando você coloca um elefante no micro-ondas? Ele fica quente, claro!",
      "Qual é o melhor amigo do homem? O cachorro, claro, mas o computador também ajuda!",
      "O que é um vegetariano que come carne? Um ex-vegetariano.",
      "Por que o tomate não conseguiu se esconder? Porque ele ficou vermelho de vergonha.",
      "O que é pior do que encontrar um cabelo na sopa? Encontrar meia sopa no cabelo!",
      "Por que o livro de história não está atualizado? Porque ele ficou no passado.",
      "Qual é a fórmula da água benta? H Deus O!",
      "Por que o jacaré tirou o filho da escola? Porque ele réptil de ano.",
      "O que o pintor disse para o quadro? 'Você está muito bem, já está na moldura!'",
      "Qual é o cachorro que mais sabe matemática? O vira-lata.",
      "O que é o cúmulo da preguiça? Deitar no sofá e não querer nem mexer a mão para pegar o controle.",
      "O que é o cúmulo da falta de sorte? Ser atropelado por um carro em um dia de chuva, com a sorte de não se molhar!",
      "Qual é a cidade mais divertida? Rio de Janeiro, porque tem o maior número de piadas!",
      "Sabe qual é o melhor jeito de nunca perder o emprego? Não aceitar promoção!",
      "O que é um autor que escreve sem parar? Um escritor incansável.",
      "Por que o peixe é ruim de matemática? Porque vive nadando entre números!",
      "Por que o gato foi ao cinema? Para ver o filme 'O Gato de Botas'.",
      "Qual é o café mais forte do mundo? O café expresso!",
      "Sabe o que é pior do que cair de um prédio de 10 andares? Cair em um buraco de 20!",
      "Qual é o animal mais legal? O pinguim, porque ele está sempre na moda, com aquele traje preto e branco!",
      "Qual é a melhor maneira de organizar um evento? Sempre tenha um bom controle!",
      "Por que a abelha sempre vai ao cabeleireiro? Porque ela adora dar uma fixada no visual!"
    ];

    const piadaAleatoria = piadas[Math.floor(Math.random() * piadas.length)];

    await interaction.reply(piadaAleatoria);
  },
};
