const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('party')
    .setDescription('Convida alguém pra formar uma party.')
    .addUserOption(option =>
      option.setName('jogador')
        .setDescription('Jogador que você quer convidar pra party')
        .setRequired(true)
    ),

  async execute(interaction) {
    const user = interaction.user;
    const target = interaction.options.getUser('jogador');

    if (user.id === target.id) {
      return interaction.reply({ content: 'Você não pode formar party com você mesmo, rlk.', ephemeral: true });
    }

    const filePath = path.join(__dirname, '..', '..', 'utils', 'party.json');
    let partyData = {};

    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      partyData = JSON.parse(raw);
    }

    if (partyData[user.id]) {
      return interaction.reply({ content: 'Você já está em uma party. Use `/party-sair` antes.', ephemeral: true });
    }

    if (partyData[target.id]) {
      return interaction.reply({ content: 'Esse jogador já está em uma party.', ephemeral: true });
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`aceitar_party_${user.id}`)
        .setLabel('Aceitar convite')
        .setStyle(ButtonStyle.Success)
    );

    await interaction.reply({
      content: `${target}, ${user.username} te convidou pra uma party!`,
      components: [row]
    });

    const collector = interaction.channel.createMessageComponentCollector({
      filter: i => i.customId === `aceitar_party_${user.id}` && i.user.id === target.id,
      time: 60000
    });

    collector.on('collect', async i => {
      partyData[user.id] = target.id;
      partyData[target.id] = user.id;

      try {
        fs.writeFileSync(filePath, JSON.stringify(partyData, null, 2));
        await i.update({
          content: `🎉 ${user.username} e ${target.username} agora estão em party!`,
          components: []
        });
      } catch (err) {
        console.error('Erro ao salvar os dados da party:', err);
        await i.update({
          content: 'Houve um erro ao tentar salvar a party. Tente novamente mais tarde.',
          components: []
        });
      }
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        interaction.editReply({
          content: 'Convite expirou. Ninguém aceitou.',
          components: []
        }).catch(err => console.error('Erro ao editar mensagem:', err));
      }
    });
  }
};
