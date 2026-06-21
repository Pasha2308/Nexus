require('dotenv').config();
const { Client, GatewayIntentBits, Events, Collection } = require('discord.js');
const path = require('path');
const fs = require('fs');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ]
});

// Load slash commands
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
    console.log(`✅ Loaded command: ${command.data.name}`);
  }
}

client.once(Events.ClientReady, (c) => {
  console.log(`\n🤖 Nexus Bot is ONLINE as ${c.user.tag}`);
  console.log(`📡 Connected to ${c.guilds.cache.size} server(s)`);
});

// Handle slash commands
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error in /${interaction.commandName}:`, error);
    const msg = { content: '❌ Something went wrong. Check the console.', ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(msg);
    } else {
      await interaction.reply(msg);
    }
  }
});

// Handle plain DMs (brain dump without slash command)
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  if (message.channel.type !== 1) return; // 1 = DM channel

  const userMessage = message.content.trim();
  if (!userMessage && message.attachments.size === 0) return;

  try {
    await message.channel.sendTyping();

    // Process attachments (Images / Voice memos)
    const mediaFiles = [];
    if (message.attachments.size > 0) {
      for (const [id, attachment] of message.attachments) {
        try {
          const fileRes = await fetch(attachment.url);
          const buffer = await fileRes.arrayBuffer();
          const base64Data = Buffer.from(buffer).toString('base64');
          mediaFiles.push({
            mimeType: attachment.contentType || 'image/jpeg',
            base64Data: base64Data
          });
        } catch (e) {
          console.error('Failed to fetch attachment', e);
        }
      }
    }

    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message: userMessage || 'Attached file.', 
        history: [],
        mediaFiles: mediaFiles 
      })
    });

    const data = await response.json();
    const reply = data.reply || 'No response from Nexus.';

    // Split long messages (Discord limit is 2000 chars)
    if (reply.length > 2000) {
      const chunks = reply.match(/.{1,1950}/gs) || [];
      for (const chunk of chunks) {
        await message.reply(chunk);
      }
    } else {
      await message.reply(reply);
    }
  } catch (err) {
    console.error('DM handler error:', err);
    await message.reply('❌ Nexus is offline. Make sure `npm run dev` is running on port 3000.');
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
