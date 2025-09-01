const { SlashCommandBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./elo.db', (err) => {
    if (err) console.error(err.message);
});

db.run(`CREATE TABLE IF NOT EXISTS elo (id TEXT PRIMARY KEY, nome TEXT, elo INTEGER DEFAULT 0)`);

const allowedRoles = ['1349150304104484955'];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('perder')
        .setDescription('Remove elo para os perdedores!')
        .addUserOption(option => 
            option.setName('jogador1')
                .setDescription('Jogador que perdeu')
                .setRequired(true))
        .addUserOption(option => 
            option.setName('jogador2')
                .setDescription('Outro jogador (opcional)')
                .setRequired(false))
        .addUserOption(option => 
            option.setName('jogador3')
                .setDescription('Outro jogador (opcional)')
                .setRequired(false))
        .addUserOption(option => 
            option.setName('jogador4')
                .setDescription('Outro jogador (opcional)')
                .setRequired(false)),

    async execute(interaction) {
        if (!interaction.member.roles.cache.some(role => allowedRoles.includes(role.id))) {
            return interaction.reply({ content: 'Você não tem permissão para usar este comando!', ephemeral: true });
        }

        const jogadores = [];

        for (let i = 1; i <= 4; i++) {
            const jogador = interaction.options.getUser(`jogador${i}`);
            if (jogador) jogadores.push(jogador);
        }

        if (jogadores.length === 0) {
            return interaction.reply({ content: 'Você precisa mencionar pelo menos um jogador!', ephemeral: true });
        }

        const guild = interaction.guild;

        for (const jogador of jogadores) {
            const membro = await guild.members.fetch(jogador.id).catch(() => null);
            if (!membro) continue;

            db.get(`SELECT elo, nome FROM elo WHERE id = ?`, [jogador.id], (err, row) => {
                if (err) {
                    console.error(err);
                    return;
                }

                let novoElo = (row ? row.elo : 0) - 30;
                let nomeOriginal = row ? row.nome : membro.user.username;

                db.run(`INSERT INTO elo (id, nome, elo) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET elo = ?`,
                    [jogador.id, nomeOriginal, novoElo, novoElo]);

                const nomeSemElo = nomeOriginal.replace(/^\[\d+\]\s*/, '');
                const novoNome = `[${novoElo}] ${nomeSemElo}`;
                membro.setNickname(novoNome).catch(() => null);
            });
        }

        await interaction.reply({ content: 'Elo atualizado para os jogadores mencionados!', ephemeral: true });
    }
};
