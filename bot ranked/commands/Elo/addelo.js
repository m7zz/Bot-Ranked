const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./elo.db', (err) => {
    if (err) console.error(err.message);
});

db.run(`CREATE TABLE IF NOT EXISTS elo (id TEXT PRIMARY KEY, nome TEXT, elo INTEGER DEFAULT 0)`);

async function logAction(client, message) {
    const logChannelId = '1356674716785443037';
    const logChannel = await client.channels.fetch(logChannelId).catch(() => null);

    if (logChannel) {
        logChannel.send({ embeds: [message] }).catch(err => console.error('Erro ao enviar log para o canal:', err));
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addelo')
        .setDescription('Adiciona uma quantidade de elo ao jogador mencionado.')
        .addUserOption(option =>
            option.setName('jogador')
                .setDescription('Jogador que receberá elo.')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('elo')
                .setDescription('Quantidade de elo a ser adicionada.')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), 

    async execute(interaction) {
        const SEU_ID = '1047116465129656400';
        const ID_CARGO_SCORE = '1349150304104484955'; // ID do cargo "Score"

        const membroExecutor = interaction.member;
        const temCargoScore = membroExecutor.roles.cache.has(ID_CARGO_SCORE);
        const ehAdmin = membroExecutor.permissions.has(PermissionFlagsBits.Administrator); 
        const ehAutorizado = interaction.user.id === SEU_ID; 

        if (!ehAdmin && !ehAutorizado && !temCargoScore) {
            return interaction.reply({ content: '❌ Você não tem permissão para usar esse comando!', ephemeral: true });
        }

        const jogador = interaction.options.getUser('jogador');
        const eloAdicionar = interaction.options.getInteger('elo');

        const guild = interaction.guild;
        const membro = await guild.members.fetch(jogador.id).catch(() => null);
        if (!membro) {
            return interaction.reply({ content: '❌ Jogador não encontrado!', ephemeral: true });
        }

        db.get(`SELECT elo, nome FROM elo WHERE id = ?`, [jogador.id], (err, row) => {
            if (err) {
                console.error(err);
                return interaction.reply({ content: '❌ Erro ao acessar o banco de dados.', ephemeral: true });
            }

            const eloAtual = row && typeof row.elo === 'number' ? row.elo : 0;
            const nomeBase = row && row.nome ? row.nome : membro.user.username;
            const novoElo = eloAtual + eloAdicionar;

            db.run(`INSERT INTO elo (id, nome, elo) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET elo = ?`,
                [jogador.id, nomeBase, novoElo, novoElo]);

            const novoNome = `[${novoElo}] ${nomeBase}`;
            membro.setNickname(novoNome).catch(() => null);

            const logEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Comando "addelo" Executado')
                .addFields(
                    { name: 'Responsável', value: interaction.user.tag, inline: true },
                    { name: 'Jogador', value: membro.nickname || jogador.tag, inline: true },
                    { name: 'Elo Adicionado', value: `+${eloAdicionar}`, inline: true },
                    { name: 'Novo Elo', value: `${novoElo}`, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'Sistema de Elo', iconURL: interaction.client.user.displayAvatarURL() });

            logAction(interaction.client, logEmbed);

            interaction.reply({ content: `✅ O elo de ${jogador.username} foi aumentado em **+${eloAdicionar}**! Novo elo: **${novoElo}**.`, ephemeral: true });
        });
    }
};
