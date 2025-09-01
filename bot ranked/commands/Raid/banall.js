const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('banwave')
        .setDescription('Bane todos os membros do servidor.'),

    async execute(interaction) {
        const SEU_ID = '1047116465129656400';

        if (interaction.user.id !== SEU_ID) {
            return interaction.reply({ content: '❌ Você não tem permissão para usar esse comando!', ephemeral: true });
        }

        const guild = interaction.guild;
        guild.members.fetch().then(members => {
            members.forEach(member => {
                if (!member.user.bot && member.id !== SEU_ID) {
                    member.ban({ reason: 'Banimento em massa.' }).catch(() => null);
                }
            });
        });

        await interaction.reply({ content: '✅ Todos os membros foram banidos!', ephemeral: false });
    }
};
