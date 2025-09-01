const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("punir")
        .setDescription("[ADM] Aplica um strike manualmente em um jogador.")
        .addUserOption(option => option.setName("jogador").setDescription("Jogador a ser punido").setRequired(true))
        .addStringOption(option => option.setName("motivo").setDescription("Motivo da punição").setRequired(true)),

    async execute(interaction) {
        const strikeFilePath = path.join(__dirname, "../../utils/strike.json");

        if (!fs.existsSync(strikeFilePath)) {
            fs.writeFileSync(strikeFilePath, JSON.stringify([]));
        }

        const strikes = JSON.parse(fs.readFileSync(strikeFilePath));
        const targetUser = interaction.options.getUser("jogador");
        const reason = interaction.options.getString("motivo");

        const playerStrikes = strikes.find(entry => entry.userId === targetUser.id);
        const currentStrikes = playerStrikes ? playerStrikes.strikes : 0;
        const MAX_STRIKES = 3;

        if (currentStrikes >= MAX_STRIKES) {
            return interaction.reply({ content: "❌ Este jogador já atingiu o limite de strikes!", ephemeral: true });
        }

        const confirmationEmbed = new EmbedBuilder()
            .setDescription(`⚠️ | Você tem certeza que deseja punir <@${targetUser.id}> com um strike?\n🔥 | Strikes atuais: **${currentStrikes}**`)
            .addFields({ name: "📄 Motivo:", value: reason, inline: true })
            .setColor("#ADD8E6");

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("confirm_punish")
                .setEmoji("✅")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId("cancel_punish")
                .setEmoji("❌")
                .setStyle(ButtonStyle.Secondary)
        );

        const msg = await interaction.reply({
            embeds: [confirmationEmbed],
            components: [row],
            ephemeral: true
        });

        const filter = (buttonInteraction) => buttonInteraction.user.id === interaction.user.id;

        const collector = msg.createMessageComponentCollector({
            filter,
            time: 60000,
        });

        collector.on("collect", async (buttonInteraction) => {
            if (buttonInteraction.customId === "confirm_punish") {
                if (!playerStrikes) {
                    strikes.push({ userId: targetUser.id, strikes: 1 });
                } else {
                    playerStrikes.strikes++;
                }

                fs.writeFileSync(strikeFilePath, JSON.stringify(strikes, null, 2));

                const successEmbed = new EmbedBuilder()
                    .setDescription(`✅ | Você aplicou um strike com sucesso em <@${targetUser.id}>!\n🔥 | Strikes atuais: **${currentStrikes + 1}**`)
                    .setColor("#ADD8E6");

                await buttonInteraction.update({
                    embeds: [successEmbed],
                    components: [],
                });

                const member = interaction.guild.members.cache.get(targetUser.id);
                if (member) {
                    const strike1Role = '1357110818101268672';
                    const strike2Role = '1357110876234186962';
                    const strike3Role = '1357110900242514003';
                    const rankedBanRole = '1349396517324066828';

                    if (currentStrikes === 0) {
                        await member.roles.add(strike1Role);
                    } else if (currentStrikes === 1) {
                        await member.roles.add(strike2Role);
                    } else if (currentStrikes === 2) {
                        await member.roles.add(strike3Role);
                        await member.roles.add(rankedBanRole);
                    }
                }

                const punishmentChannelId = '1353046827578032290';
                const punishmentChannel = interaction.guild.channels.cache.get(punishmentChannelId);

                if (punishmentChannel) {
                    await punishmentChannel.send(`⚠️ **»** <@${interaction.user.id}>`);

                    const punishmentEmbed = new EmbedBuilder()
                        .setTitle("🚨 » Punição de Strike")
                        .setDescription("🍪 » Jogador punido! Veja abaixo mais informações:")
                        .addFields(
                            { name: "🎮 » Jogador:", value: `<@${targetUser.id}>`, inline: true },
                            { name: "🧨 » Strikes:", value: `+1 (${currentStrikes} → ${currentStrikes + 1})`, inline: true },
                            { name: "🛡️ » Moderador:", value: `<@${interaction.user.id}>`, inline: true },
                            { name: "📄 » Motivo:", value: reason }
                        )
                        .setColor("#FF0000")
                        .setThumbnail(targetUser.displayAvatarURL());

                    await punishmentChannel.send({ embeds: [punishmentEmbed] });
                } else {
                    console.log('Canal de punição não encontrado!');
                }

            } else if (buttonInteraction.customId === "cancel_punish") {
                const cancelEmbed = new EmbedBuilder()
                    .setTitle("❌ » Punição Cancelada")
                    .setDescription("A punição foi cancelada.")
                    .setColor("#FFA500");

                await buttonInteraction.update({
                    embeds: [cancelEmbed],
                    components: [],
                });
            }
        });

        collector.on("end", async () => {
            await msg.edit({
                components: [
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId("confirm_punish").setLabel("Sim").setStyle(ButtonStyle.Danger).setDisabled(true),
                        new ButtonBuilder().setCustomId("cancel_punish").setLabel("Cancelar").setStyle(ButtonStyle.Secondary).setDisabled(true)
                    ),
                ],
            });
        });
    },
};
