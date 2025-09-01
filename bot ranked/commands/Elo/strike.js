const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("strike")
        .setDescription("[Geral] Solicita um strike."),

    async execute(interaction) {
        const strikeFilePath = path.join(__dirname, "../../utils/strike.json");

        if (!fs.existsSync(strikeFilePath)) {
            fs.writeFileSync(strikeFilePath, JSON.stringify([]));
        }

        const strikes = JSON.parse(fs.readFileSync(strikeFilePath));
        const playerStrikes = strikes.find((entry) => entry.userId === interaction.user.id);
        const currentStrikes = playerStrikes ? playerStrikes.strikes : 0;

        const MAX_STRIKES = 3;

        if (currentStrikes >= MAX_STRIKES) {
            return interaction.reply({ content: "❌ Você já atingiu o limite de strikes!", ephemeral: true });
        }

        const confirmationEmbed = new EmbedBuilder()
            .setDescription(`⚠️ | Você tem certeza que deseja solicitar um strike?\n🎯 | Seus strikes: **${currentStrikes}**`)
            .setColor("#ADD8E6");

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("confirm_strike")
                .setEmoji("✅")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId("cancel_strike")
                .setEmoji("❌")
                .setStyle(ButtonStyle.Secondary)
        );

        const msg = await interaction.reply({
            embeds: [confirmationEmbed],
            components: [row],
            ephemeral: true
        });

        const filter = (i) => i.user.id === interaction.user.id;

        const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

        collector.on("collect", async (buttonInteraction) => {
            if (buttonInteraction.customId === "confirm_strike") {
                if (!playerStrikes) {
                    strikes.push({ userId: interaction.user.id, strikes: 1 });
                } else {
                    playerStrikes.strikes++;
                }

                fs.writeFileSync(strikeFilePath, JSON.stringify(strikes, null, 2));

                const successEmbed = new EmbedBuilder()
                    .setDescription(`✅ | Você solicitou um strike com sucesso!\n🎯 | Seus Strikes: **${currentStrikes + 1}**`)
                    .setColor("#ADD8E6");

                await buttonInteraction.update({
                    embeds: [successEmbed],
                    components: [],
                });

                const member = interaction.guild.members.cache.get(interaction.user.id);
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

                const punishmentChannelId = '1358523495688175789';
                const punishmentChannel = interaction.guild.channels.cache.get(punishmentChannelId);

                if (punishmentChannel) {
                    await punishmentChannel.send(`⚠️ **» **<@${interaction.user.id}>`);

                    const punishmentEmbed = new EmbedBuilder()
                        .setTitle(`🚨 » Strike Aranked: Strike`)
                        .setDescription(`🍪 » Você foi punido! Veja abaixo mais informações:`)
                        .addFields(
                            { name: `🎮 » Jogador:`, value: `<@${interaction.user.id}>`, inline: true },
                            { name: `🧨 » Strikes:`, value: `+1 (${currentStrikes} → ${currentStrikes + 1})`, inline: true },
                            { name: `👮 » Moderador:`, value: `<@${interaction.client.user.id}>`, inline: true },
                            { name: `📄 » Motivo:`, value: "Solicitou strike" }
                        )
                        .setColor("#FF0000")
                        .setThumbnail(interaction.user.displayAvatarURL());

                    await punishmentChannel.send({ embeds: [punishmentEmbed] });
                } else {
                    console.log('Canal de punição não encontrado!');
                }

                const notificationEmbed = new EmbedBuilder()
                    .setDescription(`🎯 | O jogador <@${interaction.user.id}> acaba de solicitar um strike!`)
                    .setColor("#ff6961");

                const channelId = '1353046827578032290'; 
                const channel = interaction.guild.channels.cache.get(channelId);

                if (channel) {
                    const backToQueueButton = new ButtonBuilder()
                        .setCustomId("back_to_queue")
                        .setLabel("Voltar para a Fila")
                        .setStyle(ButtonStyle.Secondary);

                    const newRow = new ActionRowBuilder().addComponents(backToQueueButton);

                    const notificationMessage = await channel.send({ embeds: [notificationEmbed], components: [newRow] });

                    // Novo collector pra esse botão!
                    const backCollector = notificationMessage.createMessageComponentCollector({
                        filter: (i) => i.customId === "back_to_queue",
                        time: 60000
                    });

                    backCollector.on("collect", async (btn) => {
                        const voiceChannelId = '1343704996482646036'; // canal de voz da fila
                        const voiceChannel = interaction.guild.channels.cache.get(voiceChannelId);

                        if (voiceChannel) {
                            const member = interaction.guild.members.cache.get(btn.user.id);
                            if (member && member.voice.channel) {
                                await member.voice.setChannel(voiceChannel);
                                await btn.reply({ content: "Você foi movido de volta para a fila!", ephemeral: true });
                            } else {
                                await btn.reply({ content: "Você precisa estar em um canal de voz primeiro!", ephemeral: true });
                            }
                        } else {
                            await btn.reply({ content: "O canal de voz não foi encontrado!", ephemeral: true });
                        }
                    });

                } else {
                    console.log('Canal não encontrado!');
                }

            } else if (buttonInteraction.customId === "cancel_strike") {
                const cancelEmbed = new EmbedBuilder()
                    .setTitle(`❌ » Solicitação de Strike Cancelada`)
                    .setDescription("A solicitação de strike foi cancelada.")
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
                        new ButtonBuilder().setCustomId("confirm_strike").setLabel("Sim").setStyle(ButtonStyle.Danger).setDisabled(true),
                        new ButtonBuilder().setCustomId("cancel_strike").setLabel("Cancelar").setStyle(ButtonStyle.Secondary).setDisabled(true)
                    ),
                ],
            });
        });
    },
};
