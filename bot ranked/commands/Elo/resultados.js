const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("resultados")
    .setDescription("Mostra resultados de partidas anteriores.")
    .addStringOption(option =>
      option.setName("tipo")
        .setDescription("Buscar último resultado ou por ID")
        .setRequired(true)
        .addChoices(
          { name: "último", value: "ultimo" },
          { name: "id", value: "id" }
        ))
    .addStringOption(option =>
      option.setName("valor")
        .setDescription("ID da partida (se escolheu 'id')")
        .setRequired(false)),

  async execute(interaction) {
    const tipo = interaction.options.getString("tipo");
    const valor = interaction.options.getString("valor");

    const historyPath = path.join(__dirname, "../../utils/history.json");

    if (!fs.existsSync(historyPath)) {
      return interaction.reply({ content: "❌ Nenhum histórico foi registrado ainda!", ephemeral: true });
    }

    const history = JSON.parse(fs.readFileSync(historyPath));

    if (history.length === 0) {
      return interaction.reply({ content: "📭 Ainda não há resultados salvos!", ephemeral: true });
    }

    let partida;

    if (tipo === "ultimo") {
      partida = history[history.length - 1];
    } else if (tipo === "id") {
      partida = history.find(p => p.id === valor);
      if (!partida) {
        return interaction.reply({ content: `❌ Nenhuma partida encontrada com o ID: ${valor}`, ephemeral: true });
      }
    }

    const embed = new EmbedBuilder()
      .setTitle(`📊 Resultado da Partida #${partida.id}`)
      .setColor("#FFD700")
      .setDescription(`🕓 ${new Date(partida.data).toLocaleString("pt-BR")}`)
      .addFields(
        { name: "💙 Time 1", value: `${partida.time1.join("\n")}\n**Pontos:** ${partida.pontosTime1}`, inline: true },
        { name: "❤ Time 2", value: `${partida.time2.join("\n")}\n**Pontos:** ${partida.pontosTime2}`, inline: true }
      )
      .setFooter({ text: "Histórico de partidas" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};