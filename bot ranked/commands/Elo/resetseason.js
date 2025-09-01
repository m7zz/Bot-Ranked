const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("resetseason")
    .setDescription("Reseta o elo de todos os jogadores para 0"),

  async execute(interaction) {
    if (!interaction.guild) return interaction.reply({ content: "Este comando só pode ser usado em um servidor.", ephemeral: true });

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: "❌ Você não tem permissão para usar esse comando.", ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    const members = await interaction.guild.members.fetch();

    let total = 0;

    for (const member of members.values()) {
      // Pula bots
      if (member.user.bot) continue;

      const originalName = member.nickname || member.user.username;

      const nomeSemElo = originalName.replace(/^\[\d+\]\s*/, "");

      const novoNick = `[0] ${nomeSemElo}`;

      try {
        await member.setNickname(novoNick);
        total++;
      } catch (err) {
        console.log(`Não consegui mudar o nick de ${member.user.tag}`);
      }
    }

    await interaction.editReply(`✅ Temporada resetada! Total de jogadores resetados: **${total}**`);
  },
};
