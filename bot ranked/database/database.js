const fs = require('fs');
const path = './database.json';

let database = { players: [], captains: [], history: [] };

function loadDatabase() {
  try {
    if (fs.existsSync(path)) {
      const data = fs.readFileSync(path);
      database = JSON.parse(data);
    }
  } catch (error) {
    console.error('Erro ao carregar o banco de dados:', error);
  }
}

function saveDatabase() {
  try {
    fs.writeFileSync(path, JSON.stringify(database, null, 2));
  } catch (error) {
    console.error('Erro ao salvar o banco de dados:', error);
  }
}

function addPlayer(player) {
  database.players.push(player);
  saveDatabase();
}

function getCaptains() {
  return database.captains;
}

function setCaptains(captains) {
  database.captains = captains;
  saveDatabase();
}

function addMatchToHistory(team1, team2, score1, score2) {
  const match = { team1, team2, score1, score2 };
  database.history.push(match);
  saveDatabase();
}

function getHistory() {
  return database.history;
}

function getPlayersInQueue() {
  return database.players;
}

module.exports = {
  loadDatabase,
  saveDatabase,
  addPlayer,
  getCaptains,
  setCaptains,
  addMatchToHistory,
  getHistory,
  getPlayersInQueue,
};
