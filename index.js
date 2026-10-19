const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const TOKEN = process.env.TOKEN;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const commands = [
    new SlashCommandBuilder()
        .setName('podziel')
        .setDescription('Dzieli łup z napadu równo pomiędzy członków ekipy.')
        .addIntegerOption(option =>
            option.setName('kwota')
                .setDescription('Całkowita kwota z napadu ($)')
                .setRequired(true)
                .setMinValue(1))
        .addIntegerOption(option =>
            option.setName('osoby')
                .setDescription('Liczba osób biorących udział')
                .setRequired(true)
                .setMinValue(1))
].map(command => command.toJSON());

client.once('ready', async () => {
    console.log(`Zalogowano jako ${client.user.tag}!`);
    const rest = new REST({ version: '10' }).setToken(TOKEN);
    try {
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands }
        );
        console.log('Komenda /podziel została pomyślnie zarejestrowana!');
    } catch (error) {
        console.error('Błąd rejestracji komend:', error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'podziel') {
        const kwota = interaction.options.getInteger('kwota');
        const osoby = interaction.options.getInteger('osoby');

        const naOsobe = Math.floor(kwota / osoby);
        const reszta = kwota % osoby;

        const formatuj = (num) => num.toLocaleString('pl-PL');

        const embed = new EmbedBuilder()
            .setColor(0x2b2d31)
            .setTitle('💰 Podział Łupu z Napadu')
            .addFields(
                { name: '💵 Całkowita kwota:', value: `$${formatuj(kwota)}`, inline: true },
                { name: '👥 Liczba osób:', value: `${osoby}`, inline: true },
                { name: '💳 Wypłata na osobę:', value: `**$${formatuj(naOsobe)}**`, inline: false }
            )
            .setTimestamp()
            .setFooter({ text: 'RP Loot Splitter' });

        if (reszta > 0) {
            embed.addFields({
                name: '⚖️ Reszta (do skarbca organizacji):',
                value: `$${formatuj(reszta)}`,
                inline: false
            });
        }

        await interaction.reply({ embeds: [embed] });
    }
});

client.login(TOKEN);