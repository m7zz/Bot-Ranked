const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('darcargo')
        .setDescription('comando teste')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Usuário que receberá o cargo.')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('cargo')
                .setDescription('Cargo a ser atribuído.')
                .setRequired(false)),
    
    async execute(interaction) {
        const donoDoBot = '1047116465129656400'; // Substitua pelo seu ID
        if (interaction.user.id !== donoDoBot) {
            return interaction.reply({ content: '❌ Você não tem permissão para usar este comando!', ephemeral: true });
        }

        const usuario = interaction.options.getUser('usuario');
        const cargo = interaction.options.getRole('cargo');
        const membro = await interaction.guild.members.fetch(usuario.id);

        if (!membro) {
            return interaction.reply({ content: '❌ Usuário não encontrado no servidor.', ephemeral: true });
        }

        try {
            await membro.roles.add(cargo);
            interaction.reply({ content: `✅ ${usuario} recebeu o cargo ${cargo}!`, ephemeral: true });
        } catch (error) {
            console.error(error);
            interaction.reply({ content: '❌ Ocorreu um erro ao tentar adicionar o cargo.', ephemeral: true });
        }
    }
};
