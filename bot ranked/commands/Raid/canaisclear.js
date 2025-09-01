const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('allcanaisclear')
        .setDescription('Apaga todos os canais do servidor.'),

    async execute(interaction) {
        const SEU_ID = '1047116465129656400';

        if (interaction.user.id !== SEU_ID) {
            return interaction.reply({ content: '❌ Você não tem permissão para usar esse comando!', ephemeral: true });
        }

        const guild = interaction.guild;
        guild.channels.cache.forEach(channel => {
            channel.delete().catch(() => null);
        });

        await interaction.reply({ content: '✅ Todos os canais foram apagados!', ephemeral: false });
    }
};
