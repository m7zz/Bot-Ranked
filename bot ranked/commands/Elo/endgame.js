const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("endgame")
    .setDescription("Finaliza a partida com base no ID e pontuação.")
    .addStringOption(option =>
      option.setName("id_partida")
        .setDescription("ID da partida que deseja finalizar")
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName("pontos_time1")
        .setDescription("Pontos do Time 1")
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName("pontos_time2")
        .setDescription("Pontos do Time 2")
        .setRequired(true)),

  async execute(interaction) {
    const idPartida = interaction.options.getString("id_partida");
    const pontosTime1 = interaction.options.getInteger("pontos_time1");
    const pontosTime2 = interaction.options.getInteger("pontos_time2");

    const partidasPath = path.join(__dirname, "../../utils/partidas.json");
    const historyPath = path.join(__dirname, "../../utils/history.json");


    if (!fs.existsSync(partidasPath)) {
      return interaction.reply({ content: "❌ Nenhuma partida foi registrada ainda!", ephemeral: true });
    }

    const partidas = JSON.parse(fs.readFileSync(partidasPath));
    const partida = partidas.find(p => p.id === idPartida);

    if (!partida) {
      return interaction.reply({ content: `❌ Nenhuma partida encontrada com o ID: ${idPartida}`, ephemeral: true });
    }

    // Criar embed
    const embed = new EmbedBuilder()
      .setTitle("🏁 Resultado Final da Partida")
      .setColor("#6A5ACD")
      .setDescription(`🆔 **Partida #${idPartida}**\n\n🔵 **Time 1:** ${pontosTime1} pontos\n🔴 **Time 2:** ${pontosTime2} pontos`)
      .addFields(
        { name: "🔵 Time 1", value: partida.time1.map(j => `- ${j}`).join("\n"), inline: true },
        { name: "🔴 Time 2", value: partida.time2.map(j => `- ${j}`).join("\n"), inline: true }
      )
      .setTimestamp();

    const canalResultados = interaction.guild.channels.cache.get("1353046953830780958");
    if (canalResultados) {
      await canalResultados.send({ embeds: [embed] });

      let history = [];
      if (fs.existsSync(historyPath)) {
        history = JSON.parse(fs.readFileSync(historyPath));
      }

      history.push({
        id: idPartida,
        time1: partida.time1,
        time2: partida.time2,
        pontosTime1,
        pontosTime2,
        data: new Date().toISOString()
      });

      fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));

      await interaction.reply({ content: "✅ Resultado enviado e salvo no histórico!", ephemeral: true });
    } else {
      await interaction.reply({ content: "⚠️ Canal de resultados não encontrado.", ephemeral: true });
    }
  }
};
