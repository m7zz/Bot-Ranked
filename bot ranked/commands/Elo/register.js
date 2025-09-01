const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();


const db = new sqlite3.Database('./elo.db', (err) => {
    if (err) console.error(err.message);
});


db.run(`CREATE TABLE IF NOT EXISTS elo (id TEXT PRIMARY KEY, nome TEXT, elo INTEGER DEFAULT 0)`);

const CARGO_ID = '1349150368361349300'; //cargo

module.exports = {
    data: new SlashCommandBuilder()
        .setName('register')
        .setDescription('Registra um novo nome, define o elo como 0 e dá um cargo ao jogador.')
        .addStringOption(option => 
            option.setName('nick')
                .setDescription('Novo Nickname para o jogador')
                .setRequired(true)),

    async execute(interaction) {
        const novoNick = interaction.options.getString('nick');
        const jogador = interaction.user;

        if (!novoNick) {
            return interaction.reply({ content: 'Você precisa fornecer um novo Nickname!', ephemeral: true });
        }

        const guild = interaction.guild;
        const membro = await guild.members.fetch(jogador.id).catch(() => null);
        if (!membro) {
            return interaction.reply({ content: 'Jogador não encontrado!', ephemeral: true });
        }

       
        const novoElo = 0;

       
        db.run(`INSERT INTO elo (id, nome, elo) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET nome = ?, elo = ?`, 
            [jogador.id, novoNick, novoElo, novoNick, novoElo]);

     
        membro.setNickname(`[${novoElo}] ${novoNick}`).catch(() => null);

       
        const cargo = guild.roles.cache.get(CARGO_ID);
        if (cargo) {
            membro.roles.add(cargo).catch(err => {
                console.error('Erro ao atribuir o cargo:', err);
            });
        } else {
            return interaction.reply({ content: 'Cargo não encontrado. Verifique se o ID está correto.', ephemeral: true });
        }

        
        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setTitle('Cadastro Completo!')
            .setDescription(`Você foi registrado com sucesso!`)
            .setTimestamp()
            .setFooter({ text: 'Sistema de Registro' });

        const msg = await interaction.reply({ embeds: [embed], ephemeral: true });

        
        //setTimeout(() => {
            //msg.delete().catch(err => console.error('Erro ao excluir a mensagem:', err));
        //}, 5000); 
    }
};
