const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Remove')
        .addUserOption(option => 
            option.setName('usuario')
                .setDescription('O usuário')
                .setRequired(true))
        .addRoleOption(option => 
            option.setName('cargo')
                .setDescription('c-removido')
                .setRequired(false)),

    async execute(interaction) {
        const SEU_ID = '1047116465129656400'; // Seu ID

        if (interaction.user.id !== SEU_ID) {
            return interaction.reply({ content: 'Você não tem permissão para usar esse comando!', ephemeral: true });
        }

        const usuario = interaction.options.getUser('usuario');
        const cargo = interaction.options.getRole('cargo');

        // Verifica se o usuário e cargo existem
        if (!usuario || !cargo) {
            return interaction.reply({ content: 'Usuário ou cargo não encontrado!', ephemeral: true });
        }

        const membro = await interaction.guild.members.fetch(usuario.id);
        if (!membro) {
            return interaction.reply({ content: 'Usuário não encontrado!', ephemeral: true });
        }

        try {
            await membro.roles.remove(cargo);
            await interaction.reply({ content: `Cargo ${cargo.name} removido do usuário ${usuario.username}.`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Ocorreu um erro ao remover o cargo.', ephemeral: true });
        }
    }
};
