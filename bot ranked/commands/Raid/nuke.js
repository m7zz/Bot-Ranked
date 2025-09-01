const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nuke')
    .setDescription('🛠️ [ADM] Apague e Renove o Canal')
    .addChannelOption(option => 
      option.setName('channel')
        .setDescription('Qual será o canal que irá ser nukado?')
        .setRequired(false)
    ),

  async execute(interaction) {
    // Verifica se o usuário tem permissão de Administrador ou se é o seu ID
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator) && interaction.user.id !== "1047116465129656400") {
      return interaction.reply({ content: `Você não tem permissão para utilizar este comando.`, ephemeral: true });
    }

    const channel = interaction.options.getChannel('channel') || interaction.channel;

    try {
      // Clona e deleta o canal original
      const clonedChannel = await channel.clone();
      await channel.delete();

      // Envia uma mensagem no novo canal
      await clonedChannel.send(`Nuked by \`${interaction.user.username}\``);

      // Resposta confirmando a execução do comando
      return interaction.reply({ content: `O canal foi nukado e renovado com sucesso!`, ephemeral: true });
    } catch (error) {
      console.error(error);
      return interaction.reply({ content: `❌ Algo deu errado ao tentar nuke o canal.`, ephemeral: true });
    }
  }
};
