const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('party-sair')
    .setDescription('Sai da party atual (se estiver em uma).'),

  async execute(interaction) {
    const userId = interaction.user.id;
    const filePath = path.join(__dirname, '..', '..', 'utils', 'party.json');
    let partyData = {};

    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      partyData = JSON.parse(raw);
    }

    const parceiro = partyData[userId];
    if (!parceiro) {
      return interaction.reply({ content: 'Você não está em nenhuma party.', ephemeral: true });
    }

    // Remover os dois lados da party
    delete partyData[userId];
    delete partyData[parceiro];

    fs.writeFileSync(filePath, JSON.stringify(partyData, null, 2));

    return interaction.reply({ content: 'Você saiu da party com sucesso.', ephemeral: true });
  }
};
