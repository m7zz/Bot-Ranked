const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./elo.db', (err) => {
    if (err) console.error(err.message);
});

db.run(`CREATE TABLE IF NOT EXISTS elo (id TEXT PRIMARY KEY, nome TEXT, elo INTEGER DEFAULT 0)`);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setelo')
        .setDescription('Define um valor específico de elo para o jogador mencionado.')
        .addUserOption(option =>
            option.setName('jogador')
                .setDescription('Jogador que terá o elo definido.')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('elo')
                .setDescription('Novo valor de elo a ser definido.')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // Permissão para administradores

    async execute(interaction) {
        const SEU_ID = '1047116465129656400';
        const ID_CARGO_SCORE = '1349150304104484955'; 

        const membroExecutor = interaction.member;
        const temCargoScore = membroExecutor.roles.cache.has(ID_CARGO_SCORE); 
        const ehAdmin = membroExecutor.permissions.has(PermissionFlagsBits.Administrator); 
        const ehAutorizado = interaction.user.id === SEU_ID; 

        if (!ehAdmin && !ehAutorizado && !temCargoScore) {
            return interaction.reply({ content: '❌ Você não tem permissão para usar esse comando!', ephemeral: true });
        }

        const jogador = interaction.options.getUser('jogador');
        const novoElo = interaction.options.getInteger('elo');

        const guild = interaction.guild;
        const membro = await guild.members.fetch(jogador.id).catch(() => null);
        if (!membro) {
            return interaction.reply({ content: '❌ Jogador não encontrado!', ephemeral: true });
        }

        const nomeAtual = membro.nickname || membro.user.username;
        const nomeSemElo = nomeAtual.replace(/^\[\d+\]\s*/, ''); // Remove o elo do nome atual
        const novoNome = `[${novoElo}] ${nomeSemElo}`;

        db.run(`INSERT INTO elo (id, nome, elo) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET elo = ?`, 
            [jogador.id, nomeSemElo, novoElo, novoElo]);

        membro.setNickname(novoNome).catch(() => null);

        const logEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Comando "setelo" Executado')
            .addFields(
                { name: 'Responsável', value: interaction.user.tag, inline: true },
                { name: 'Jogador', value: membro.nickname || jogador.tag, inline: true },
                { name: 'Elo Definido', value: `${novoElo}`, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: 'Sistema de Elo', iconURL: interaction.client.user.displayAvatarURL() });

        const logChannel = interaction.guild.channels.cache.get('1356674716785443037');
        if (logChannel) {
            logChannel.send({ embeds: [logEmbed] });
        }

        await interaction.reply({ content: `✅ O elo do jogador ${jogador.username} foi **definido** para ${novoElo}!`, ephemeral: true });
    }
};