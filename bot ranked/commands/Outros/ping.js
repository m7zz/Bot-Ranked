const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Mostra o ping do bot.'),
    async execute(interaction) {
        const sent = await interaction.reply({ content: '🏓 Pinging...', fetchReply: true });
        interaction.editReply(`🏓 Pong! Latência: **${sent.createdTimestamp - interaction.createdTimestamp}ms** | WebSocket: **${interaction.client.ws.ping}ms**`);
    }
};
