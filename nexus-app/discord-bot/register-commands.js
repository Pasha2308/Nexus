require('dotenv').config({ path: '../.env' });
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// The Application ID (Client ID) from Discord Developer Portal → General Information
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  commands.push(command.data.toJSON());
}

const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN);

(async () => {
  try {
    if (!CLIENT_ID) {
      console.error('❌ DISCORD_CLIENT_ID is missing in your .env file!');
      console.error('   Find it in Discord Developer Portal → Your App → General Information → Application ID');
      process.exit(1);
    }

    console.log(`🔄 Registering ${commands.length} slash commands...`);
    console.log(`📋 Application ID: ${CLIENT_ID}`);
    console.log(`🏠 Guild ID: ${process.env.DISCORD_GUILD_ID}`);

    const data = await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, process.env.DISCORD_GUILD_ID),
      { body: commands }
    );

    console.log(`✅ Successfully registered ${data.length} commands:`);
    data.forEach(cmd => console.log(`   - /${cmd.name}`));
  } catch (error) {
    console.error('❌ Failed to register commands:', error);
  }
})();
