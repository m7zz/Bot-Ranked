const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setnome')
        .setDescription('Modifica o nome de um membro, mantendo o ELO.')
        .addUserOption(option =>
            option.setName('jogador')
                .setDescription('Jogador que terá o nome modificado.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('nome')
                .setDescription('Novo apelido do jogador (sem o elo).')
                .setRequired(true)),

    async execute(interaction) {
        const SEU_ID = '1047116465129656400';

        if (interaction.user.id !== SEU_ID) {
            return interaction.reply({ content: '❌ Você não tem permissão para usar esse comando!', ephemeral: true });
        }

        const jogador = interaction.options.getUser('jogador');
        const novoApelido = interaction.options.getString('nome');

        const guild = interaction.guild;
        const membro = await guild.members.fetch(jogador.id).catch(() => null);
        if (!membro) {
            return interaction.reply({ content: '❌ Jogador não encontrado!', ephemeral: true });
        }

        const nomeAntigo = membro.nickname || jogador.username;
        const elo = parseInt(nomeAntigo.match(/\[(\d+)\]/)?.[1]) || 0;

        const novoNomeCompleto = `[${elo}] ${novoApelido}`;
        await membro.setNickname(novoNomeCompleto).catch(() => null);

        await interaction.reply({ content: `✅ O nome de ${jogador.username} foi alterado para **${novoNomeCompleto}**!`, ephemeral: false });
    }
};
