const { Events } = require("discord.js");

module.exports = {
  name: Events.GuildMemberUpdate,
  async execute(oldMember, newMember) {
    if (oldMember.nickname === newMember.nickname) return;

    const guild = newMember.guild;
    const nomeNovo = newMember.nickname || newMember.user.username;
    const nomeAntigo = oldMember.nickname || oldMember.user.username;

    const eloNovo = parseInt(nomeNovo.match(/\[(\d+)\]/)?.[1]) || 0;
    const eloAntigo = parseInt(nomeAntigo.match(/\[(\d+)\]/)?.[1]) || 0;

    const { rank: novoRank, cargo: novoCargo } = getRankAndRole(eloNovo);
    const { cargo: cargoAntigo } = getRankAndRole(eloAntigo);

    try {
      if (novoCargo) {
        const roleNova = guild.roles.cache.get(novoCargo);
        if (roleNova && !newMember.roles.cache.has(novoCargo)) {
          if (cargoAntigo && newMember.roles.cache.has(cargoAntigo)) {
            await newMember.roles.remove(cargoAntigo);
          }

          await newMember.roles.add(novoCargo);
          console.log(`Cargo atualizado para ${novoRank} em ${newMember.user.tag}`);
        }
      }
    } catch (error) {
      console.error("Erro ao atualizar o cargo:", error);
    }
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
