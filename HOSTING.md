# Discord Bot — Oracle Free Tier Hosting Guide

## 1. Oracle Cloud Setup

1. Sign up at https://cloud.oracle.com (free tier, no credit card charges)
2. Create a **Compute Instance**:
   - Shape: **VM.Standard.A1.Flex** (ARM, free tier) — 1 OCPU, 6GB RAM
   - OS: **Ubuntu 22.04**
   - Generate or upload an SSH key pair (save the private key!)
3. Under **Networking → VCN**, add an **Ingress Rule** to allow your SSH port if needed

---

## 2. Connect to Your Instance

```bash
ssh -i ~/.ssh/your_private_key ubuntu@YOUR_INSTANCE_IP
```

---

## 3. Install Node.js on the Server

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v   # should print v20.x.x
```

---

## 4. Upload Your Bot

**Option A — Git (recommended):**
```bash
# On your local machine, push to GitHub first:
git init
git add .
git commit -m "initial bot"
git remote add origin https://github.com/YOU/your-bot.git
git push -u origin main

# On the Oracle server:
git clone https://github.com/YOU/your-bot.git
cd your-bot
```

**Option B — SCP (direct copy):**
```bash
# From your local machine:
scp -i ~/.ssh/your_private_key -r ./discord-bot ubuntu@YOUR_IP:~/discord-bot
```

---

## 5. Configure Environment

```bash
cd discord-bot
cp .env.example .env
nano .env
# Fill in TOKEN and CLIENT_ID, then Ctrl+O to save, Ctrl+X to exit
```

---

## 6. Install Dependencies

```bash
npm install
```

---

## 7. Keep the Bot Running with PM2

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start the bot
pm2 start index.js --name discord-bot

# Auto-start on server reboot
pm2 startup
pm2 save
```

**Useful PM2 commands:**
```bash
pm2 status              # check if bot is running
pm2 logs discord-bot    # view live logs
pm2 restart discord-bot # restart after code changes
pm2 stop discord-bot    # stop the bot
```

---

## 8. Updating the Bot

```bash
cd ~/discord-bot
git pull           # if using Git
npm install        # in case dependencies changed
pm2 restart discord-bot
```

---

## Commands Reference

### Moderation
| Command | Description | Permission needed |
|---------|-------------|-------------------|
| `/ban` | Ban a user (+ optional message delete) | Ban Members |
| `/kick` | Kick a user | Kick Members |
| `/timeout` | Timeout a user (1min – 1 week) | Moderate Members |
| `/purge` | Bulk delete up to 100 messages | Manage Messages |
| `/warn add/list/clear` | Warning system | Moderate Members |

### Fun
| Command | Description |
|---------|-------------|
| `/8ball` | Ask the magic 8-ball |
| `/coinflip` | Flip a coin |
| `/roll` | Roll dice (e.g. 2d6, 1d20) |
| `/avatar` | View a user's avatar |
| `/userinfo` | View user details |
| `/serverinfo` | View server details |
| `/poll` | Create a yes/no poll with reactions |

---

## Bot Permissions (Discord Developer Portal)

When inviting your bot, make sure it has:
- `Send Messages`, `Embed Links`, `Add Reactions`
- `Manage Messages` (for purge)
- `Kick Members`, `Ban Members`
- `Moderate Members` (for timeout/warn)

Use this scope in your invite URL: `bot` + `applications.commands`

---

## Notes

- **Warns are in-memory** — they reset on restart. For persistent warns, consider adding `better-sqlite3`.
- Your Oracle free tier instance runs **24/7 for free** — no need to pay anything.
- Always reset your bot token at https://discord.com/developers/applications if you think it was exposed.
