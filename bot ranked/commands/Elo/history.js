const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("history")
        .setDescription("Exibe o histórico de partidas anteriores."),

    async execute(interaction) {
        const filePath = path.join(__dirname, "../../utils/history.json");
        

        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify([]));
        }

        const history = JSON.parse(fs.readFileSync(filePath));
        if (history.length === 0) {
            return interaction.reply({ content: "❌ Nenhum histórico de partidas encontrado.", ephemeral: true });
        }

        const pageSize = 6; // Número de partidas por página
        let page = 0;
        const totalPages = Math.ceil(history.length / pageSize);

        // criar o Embed
        const createEmbed = (page) => {
            const embed = new EmbedBuilder()
                .setTitle("Histórico de Partidas")
                .setColor("#6A5ACD");

            const start = page * pageSize;
            const end = Math.min(start + pageSize, history.length);

            for (let i = start; i < end; i++) {
                const match = history[i];
                embed.addFields({
                    name: `>>> Partida ${i + 1}`,
                    value: `**Time 1:** ${match.time1.join(", ")}\n**Pontos:** ${match.pontosTime1}\n\n**Time 2:** ${match.time2.join(", ")}\n**Pontos:** ${match.pontosTime2}\n**Data:** ${new Date(match.data).toLocaleString()}`,
                    inline: true
                });
            }

            return embed;
        };

        // Botões de próximo e anterior 👍
        const createButtons = (page) => {
            return new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("previous")
                    .setLabel("Anterior")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page === 0),
                new ButtonBuilder()
                    .setCustomId("next")
                    .setLabel("Próximo")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page === totalPages - 1)
            );
        };

        const embed = createEmbed(page);
        const buttons = createButtons(page);

        const msg = await interaction.reply({
            embeds: [embed],
            components: [buttons],
            ephemeral: true
        });

        const filter = (interaction) => interaction.user.id === interaction.user.id;
        const collector = msg.createMessageComponentCollector({
            filter,
            time: 60000,
        });

        collector.on("collect", async (buttonInteraction) => {
            if (buttonInteraction.customId === "previous") {
                page--;
            } else if (buttonInteraction.customId === "next") {
                page++;
            }

            const updatedEmbed = createEmbed(page);
            const updatedButtons = createButtons(page);

            await buttonInteraction.update({
                embeds: [updatedEmbed],
                components: [updatedButtons],
            });
        });

        collector.on("end", async () => {
            await msg.edit({
                components: [
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId("previous").setLabel("Anterior").setStyle(ButtonStyle.Primary).setDisabled(true),
                        new ButtonBuilder().setCustomId("next").setLabel("Próximo").setStyle(ButtonStyle.Primary).setDisabled(true)
                    ),
                ],
            });
        });
    },

    async addMatch(time1, pontosTime1, time2, pontosTime2) {
        const filePath = path.join(__dirname, "../../utils/history.json");

        const history = JSON.parse(fs.readFileSync(filePath));

        const newMatch = {
            time1: time1,
            pontosTime1: pontosTime1,
            time2: time2,
            pontosTime2: pontosTime2,
            data: new Date().toISOString() 
        };

        // Adiciona a nova partida ao histórico
        history.push(newMatch);

        fs.writeFileSync(filePath, JSON.stringify(history, null, 2));
    }
};
