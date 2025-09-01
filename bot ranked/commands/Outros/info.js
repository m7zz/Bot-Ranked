const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Mostra informações sobre o bot.'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor('#6A5ACD')
      .setTitle('Informações do Bot')
      .setDescription('Aqui estão alguns detalhes sobre o bot:')
      .addFields(
        { name: '🤖 Criador', value: 'm7zyy', inline: true },
        { name: '⚙️ Versão', value: '8.1.2', inline: true },
        { name: '📅 Última atualização', value: '30 de Abril de 2025', inline: true },
        { name: '📜 Descrição', value: 'Bot de xTreino especialmente feito pra Strike!.', inline: false },
      )
      .setFooter({ text: 'Obrigado por usar o bot! 🚀' });

    await interaction.reply({ embeds: [embed] });
  },
};
