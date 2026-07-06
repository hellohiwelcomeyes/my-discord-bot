const fs = require('fs');
const path = require('path');
const gist = require('./giststore');

const DATA_FILE = path.join(__dirname, '../data/reactionroles.json');
let data = {};
let ready = false;
let readyQueue = [];

function onReady() {
  ready = true;
  for (const fn of readyQueue) fn();
}

async function load() {
  const gistData = await gist.load();
  if (gistData) {
    data = gistData;
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    onReady();
    return;
  }

  try {
    if (fs.existsSync(DATA_FILE)) {
      data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      await gist.save(data);
    } else {
      fs.writeFileSync(DATA_FILE, '{}');
    }
  } catch {}
  onReady();
}
load();

async function save() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  await gist.save(data);
}

function awaitReady() {
  return new Promise(resolve => {
    if (ready) return resolve();
    readyQueue.push(resolve);
  });
}

async function getPanel(messageId) {
  await awaitReady();
  return data[messageId] || null;
}

async function setPanel(messageId, info) {
  await awaitReady();
  data[messageId] = info;
  await save();
}

async function deletePanel(messageId) {
  await awaitReady();
  delete data[messageId];
  await save();
}

async function getAll() {
  await awaitReady();
  return data;
}

module.exports = { load, getPanel, setPanel, deletePanel, getAll };
