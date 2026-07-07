const { Octokit } = require('@octokit/rest');

const GIST_ID = 'reactionroles-data';

let octokit = null;
let gistId = null;

function init() {
  const token = process.env.GIST_TOKEN;
  if (!token) {
    console.warn('GIST_TOKEN not set — reactionrole data will not persist across deploys');
    return false;
  }
  octokit = new Octokit({ auth: token });
  return true;
}

async function load() {
  if (!octokit) return null;
  try {
    const { data } = await octokit.gists.list({ per_page: 100 });
    for (const gist of data) {
      if (gist.files[GIST_ID]) {
        gistId = gist.id;
        const content = gist.files[GIST_ID].content;
        if (content === 'undefined' || !content) {
          console.log(`Skipping bad gist content (${gistId})`);
          continue;
        }
        const parsed = JSON.parse(content);
        if (parsed && typeof parsed === 'object') {
          console.log(`Loaded panel data from gist (${gistId})`);
          return parsed;
        }
      }
    }
  } catch (err) {
    console.error('Failed to load gist:', err?.message || err);
  }
  return null;
}

async function save(data) {
  if (!octokit) return;
  if (!data || typeof data !== 'object') {
    console.error('gist.save called with invalid data');
    return;
  }
  const content = JSON.stringify(data, null, 2);
  try {
    if (gistId) {
      await octokit.gists.update({
        gist_id: gistId,
        files: { [GIST_ID]: { content } },
      });
    } else {
      const { data: gist } = await octokit.gists.create({
        public: false,
        files: { [GIST_ID]: { content } },
      });
      gistId = gist.id;
      console.log(`Created panel gist (${gistId})`);
    }
  } catch (err) {
    console.error('Failed to save to gist:', err.message);
  }
}

module.exports = { init, load, save };
