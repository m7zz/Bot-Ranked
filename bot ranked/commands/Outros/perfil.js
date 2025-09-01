const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("perfil")
    .setDescription("Exibe as informações do perfil do jogador")
    .addUserOption((option) =>
      option.setName("jogador").setDescription("Selecione um jogador (opcional)")
    ),

  async execute(interaction) {
    const jogador = interaction.options.getUser("jogador") || interaction.user;
    const guild = interaction.guild;

    const membro = await guild.members.fetch(jogador.id).catch(() => null);
    if (!membro) {
      return interaction.reply({
        content: "Jogador não encontrado.",
        ephemeral: true,
      });
    }

    const nome = membro.nickname || jogador.username;
    const elo = parseInt(nome.match(/\[(\d+)\]/)?.[1]) || 0;
    const { rank, cargo } = getRankAndRole(elo);

    const membros = await guild.members.fetch();
    const jogadores = [];

    membros.forEach(m => {
      if (m.user.bot) return;
      const n = m.nickname || m.user.username;
      const e = parseInt(n.match(/\[(\d+)\]/)?.[1]) || 0;
      jogadores.push({ id: m.id, elo: e });
    });

    jogadores.sort((a, b) => b.elo - a.elo);
    const posicao = jogadores.findIndex(j => j.id === jogador.id) + 1;

    try {
      if (cargo && !membro.roles.cache.has(cargo)) {
        await membro.roles.add(cargo);
        console.log(`Cargo ${cargo} adicionado para ${nome}`);
      }
    } catch (error) {
      console.error("Erro ao adicionar o cargo:", error);
    }

    const embed = {
      color: 0x0099ff,
      title: `Perfil de ${nome}`,
      thumbnail: {
        url: jogador.displayAvatarURL({ format: "png", dynamic: true }),
      },
      fields: [
        {
          name: "📅 Conta criada em:",
          value: `<t:${Math.floor(jogador.createdTimestamp / 1000)}:D>`
        },
        {
          name: "🗓️ Entrou no servidor em:",
          value: `<t:${Math.floor(membro.joinedTimestamp / 1000)}:D>`
        },
        {
          name: "🆔 ID:",
          value: jogador.id,
        },
        {
          name: "💲 Elo Atual:",
          value: elo.toString(),
          inline: true,
        },
        {
          name: "🏅 Rank:",
          value: rank,
          inline: true,
        },
        {
          name: "📊 Posição no pódio:",
          value: `#${posicao}`,
          inline: true
        },
      ],
      timestamp: new Date(),
    };

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};

function getRankAndRole(elo) {
  if (elo >= 0 && elo <= 99) return { rank: "Carvão", cargo: "1349150367186686003" };
  if (elo >= 100 && elo <= 199) return { rank: "Ferro", cargo: "1349150364578086913" };
  if (elo >= 200 && elo <= 299) return { rank: "Ouro", cargo: "1349150365940977674" };
  if (elo >= 300 && elo <= 399) return { rank: "Diamante", cargo: "1349150363466465300" };
  if (elo >= 400 && elo <= 499) return { rank: "Esmeralda", cargo: "1349150362397048853" };
  if (elo >= 500 && elo <= 599) return { rank: "Safira", cargo: "1349150360953950250" };
  if (elo >= 600 && elo <= 699) return { rank: "Ruby", cargo: "1349150359653978184" };
  if (elo >= 700 && elo <= 799) return { rank: "Cristal", cargo: "1349150358496084153" };
  if (elo >= 800 && elo <= 899) return { rank: "Opala", cargo: "1349150357678329981" };
  if (elo >= 900 && elo <= 999) return { rank: "Ametista", cargo: "1349150356793458768" };
  if (elo >= 1000 && elo <= 1099) return { rank: "Obsidian", cargo: "1349150355556007958" };
  if (elo >= 1100 && elo <= 1199) return { rank: "Aventurina", cargo: "1349150354578604173" };
  if (elo >= 1200 && elo <= 1299) return { rank: "Quartzo", cargo: "1349150352762474560" };
  return { rank: "Bedrock", cargo: "1349150351558836255" };
}
