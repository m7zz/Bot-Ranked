const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ranking")
    .setDescription("Exibe o ranking dos jogadores com maior ELO"),

  async execute(interaction) {
    const membros = await interaction.guild.members.fetch();
    const jogadores = [];

    membros.forEach(membro => {
      if (membro.user.bot) return;

      const nome = membro.nickname || membro.user.username;
      const elo = parseInt(nome.match(/\[(\d+)\]/)?.[1]) || 0;

      jogadores.push({
        nome,
        elo
      });
    });

    jogadores.sort((a, b) => b.elo - a.elo);

    const top10 = jogadores.slice(0, 10);
    const ranking = top10.map((j, i) => `**#${i + 1}** - \`${j.nome}\` - **${j.elo} ELO**`).join("\n");

    const embed = {
      color: 0xFFD700,
      title: "🏆 Ranking ELO",
      description: ranking || "Nenhum jogador com ELO encontrado.",
      timestamp: new Date()
    };

    await interaction.reply({ embeds: [embed] });
  }
};
