const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const LOGS_CHANNEL_ID = '1353469195471552633';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('Faz o bot dizer uma frase.')
    .addStringOption(option =>
      option.setName('mensagem')
        .setDescription('A mensagem que o bot vai falar')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: '❌ Você não tem permissão para usar este comando entrosador safado.', ephemeral: true });
    }

    const mensagem = interaction.options.getString('mensagem');
    const logChannel = interaction.guild.channels.cache.get(LOGS_CHANNEL_ID);

    await interaction.reply({ content: `Eu disse: ${mensagem}`, ephemeral: true });
    await interaction.channel.send(mensagem);

    if (logChannel) {
      logChannel.send(`📢 **Comando /say usado!**\n👤 **Usuário:** ${interaction.user.tag} (${interaction.user.id})\n📌 **Canal:** ${interaction.channel}\n📝 **Mensagem:** ${mensagem}`);
    }
  },
};
