const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const { token, clientId, guildId } = require('./config');
const fs = require('fs');
const path = require('path');
const database = require('./database/database');


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
});

client.commands = new Collection();

const commands = [];
const commandFolders = ['Elo', 'Outros'];

for (const folder of commandFolders) {
  const commandsPath = path.join(__dirname, 'commands', folder);
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
  }
}

// Carregar eventos
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.name) {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('Registrando comandos Slash...');
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
    console.log('Comandos registrados com sucesso!');
  } catch (error) {
    console.error(error);
  }
})();


client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'Houve um erro ao executar este comando!', ephemeral: true });
  }
});

/*============================= | RESPOSTA DM E MENÇÃO | =============================*/

client.on('messageCreate', async (message) => {
  // Ignora se for um bot que está enviando a mensagem
  if (message.author.bot) return;

  // Se a mensagem for enviada em DM (mensagem privada)
  if (message.channel.type === 'DM') {
    console.log('Mensagem recebida em DM');
    return message.reply('🚫 Eu não respondo mensagens no privado! Use os comandos no servidor!');
  }

  // Se mencionaram o bot em um servidor
  if (message.mentions.has(client.user)) {
    console.log('Mencionaram o bot');
    message.reply('👋 Salve! Digite `/` para ver o que eu posso fazer.');
  }
});


/*============================= | HANDLERZINHA DE CRIA | =============================*/

process.on("uncaughtException", (err) => {
  console.log("🚫 Uncaught Exception: " + err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.log("🚫 [GRAVE] Rejeição possivelmente não tratada em: Promise ", promise, " motivo: ", reason.message);
});

client.login(token);
