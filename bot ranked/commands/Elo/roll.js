const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');

const canalRollID = '1353046898151526524'; // ID do canal onde o comando pode ser usado

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roll')
    .setDescription('Sorteia os times automaticamente.'),

  async execute(interaction) {
    try {
      // Verifica se o comando está sendo usado no canal correto
      if (!interaction.channel || interaction.channel.id !== canalRollID) {
        return interaction.reply({
          content: `❌ Este comando só pode ser usado no canal <#${canalRollID}>.`,
          ephemeral: true
        });
      }

      const voiceChannel = interaction.member.voice.channel;
      if (!voiceChannel) {
        return interaction.reply({
          content: 'Você precisa estar em um canal de voz para usar esse comando.',
          ephemeral: true
        });
      }

      const allPlayers = voiceChannel.members.filter(m => !m.user.bot);
      const players = [...allPlayers.values()];
      if (players.length < 4 || players.length > 8) {
        return interaction.reply({
          content: 'É necessário entre 4 e 8 jogadores no canal de voz.',
          ephemeral: true
        });
      }

      // Defer reply para evitar timeout
      await interaction.deferReply();

      // Carrega o party.json
      const partyPath = path.join(__dirname, '..', '..', 'utils', 'party.json');
      const partyData = fs.existsSync(partyPath) ? JSON.parse(fs.readFileSync(partyPath, 'utf8')) : {};

      const grupos = [];
      const usados = new Set();

      for (const player of players) {
        if (usados.has(player.id)) continue;

        const partnerId = partyData[player.id];
        if (
          partnerId &&
          partnerId !== player.id &&
          partyData[partnerId] === player.id &&
          allPlayers.has(partnerId)
        ) {
          const partner = allPlayers.get(partnerId);
          grupos.push([player, partner]);
          usados.add(player.id);
          usados.add(partnerId);
        } else {
          grupos.push([player]);
          usados.add(player.id);
        }
      }

      // Embaralha os grupos
      grupos.sort(() => Math.random() - 0.5);

      // Divide os grupos nos times
      const team1 = [];
      const team2 = [];

      for (const grupo of grupos) {
        (team1.length <= team2.length ? team1 : team2).push(...grupo);
      }

      const matchId = Date.now().toString().slice(-6);
      const mapas = ['Portabello', 'Hoenn', 'Mystical', 'Maple', 'GingerBread', 'WindPeak', 'Moyai', 'Skyhigh'];
      const mapaSorteado = mapas[Math.floor(Math.random() * mapas.length)];
      const categoryId = voiceChannel.parentId;

      const createTempChannel = async (teamName) => {
        return await interaction.guild.channels.create({
          name: `${teamName} • ${matchId}`,
          type: ChannelType.GuildVoice,
          parent: categoryId,
          userLimit: 4,
          permissionOverwrites: [
            {
              id: interaction.guild.id,
              deny: [PermissionsBitField.Flags.Connect],
            },
            ...players.map(player => ({
              id: player.id,
              allow: [PermissionsBitField.Flags.Connect],
            }))
          ]
        });
      };

      const channel1 = await createTempChannel('🎯┃Time 1');
      const channel2 = await createTempChannel('🎯┃Time 2');

      for (const member of team1) await member.voice.setChannel(channel1);
      for (const member of team2) await member.voice.setChannel(channel2);

      const checkAndDelete = (channel) => {
        const interval = setInterval(async () => {
          const freshChannel = await interaction.guild.channels.fetch(channel.id).catch(() => null);
          if (!freshChannel || freshChannel.members.size === 0) {
            clearInterval(interval);
            await freshChannel?.delete().catch(() => {});
          }
        }, 10000);
      };
      checkAndDelete(channel1);
      checkAndDelete(channel2);

      const embed = new EmbedBuilder()
        .setTitle('🎮 Times Sorteados')
        .setColor('#6A5ACD')
        .setDescription(`**Partida #${matchId}**\nBoa sorte aos dois times! 🔥`)
        .addFields(
          {
            name: '💖 Time 1',
            value: team1.map(p => `- ${p.displayName}`).join('\n').slice(0, 1024) || '---',
            inline: true
          },
          {
            name: '💙 Time 2',
            value: team2.map(p => `- ${p.displayName}`).join('\n').slice(0, 1024) || '---',
            inline: true
          },
          {
            name: '🗺️ Mapa Sugerido',
            value: `**${mapaSorteado}**`,
            inline: false
          }
        )
        .setFooter({ text: `ID da partida: ${matchId}` })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

      const filePath = path.join(__dirname, '..', '..', 'utils', 'partidas.json');
      let partidas = [];

      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        partidas = JSON.parse(data);
      }

      partidas.push({
        id: matchId,
        time1: team1.map(p => p.displayName),
        time2: team2.map(p => p.displayName),
        mapa: mapaSorteado,
        canal1: channel1.id,
        canal2: channel2.id,
        data: new Date().toISOString()
      });

      fs.writeFileSync(filePath, JSON.stringify(partidas, null, 2));
    } catch (err) {
      console.error('Erro no comando /roll:', err);
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({
          content: '❌ Ocorreu um erro ao executar o comando.'
        });
      } else {
        await interaction.reply({
          content: '❌ Ocorreu um erro ao executar o comando.',
          ephemeral: true
        });
      }
    }
  }
};
