const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/reactionroles.json');
let data = {};

function load() {
  try {
    if (fs.existsSync(DATA_FILE)) data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {}
}

function save() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch {}
}

load();

function getPanel(messageId) {
  return data[messageId] || null;
}

function setPanel(messageId, info) {
  data[messageId] = info;
  save();
}

function deletePanel(messageId) {
  delete data[messageId];
  save();
}

function getAll() {
  return data;
}

module.exports = { getPanel, setPanel, deletePanel, getAll };