import { Message, Client, GatewayIntentBits, SlashCommandBuilder, REST, IntentsBitField, EmbedBuilder } from 'discord.js'
import dotenv from 'dotenv'
import { bcdice_roll, systems } from './bcdice'

dotenv.config()

const client = new Client({
    intents: [GatewayIntentBits.Guilds, IntentsBitField.Flags.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
})


client.once("ready", async () => {
    console.log(systems.map(x => ({ name: `${x.name}(${x.id})`, value: x.id })));
    await client.application?.commands
        .set(
            [
                new SlashCommandBuilder()
                    .setName('r')
                    .setDescription('BCDiceでダイスロールします')
                    .addStringOption((option) =>
                        option
                            .setName('command')
                            .setDescription('コマンド (例:2d6)')
                            .setRequired(true)
                    )
                    .addStringOption((option) =>
                        option
                            .setAutocomplete(true)
                            .setDescription('ダイスボットの種類')
                            .setName('system')
                            .setRequired(false)
                    ),
                new SlashCommandBuilder()
                    .setName("bcdice")
                    .setDescription("BCDiceRollのコマンドを実行します")
            ].map((command) => command.toJSON())
        )
    // const x = new SlashCommandBuilder()
    //     .setName("r")
    //     .setDescription("BCDiceでダイスロールします").toJSON();
    // const data = [{
    //     name: "r",
    //     description: "BCDiceのコマンドをロールします",
    // },x];
    // await client.application?.commands.set(data);
    console.log("Ready!");
    console.log(client.user?.tag)
})

client.on('messageCreate', async (message: Message) => {
    try {
        if (message.author.bot) return;

        if (message.content === "!omikuji") {
            const array = ["【大吉】", "【中吉】", "【吉】", "【小吉】", "【末吉】", "【末凶】", "【凶】", "【中凶】", "【大凶】", "【豚】"];
            const res = array[Math.floor(Math.random() * array.length)];
            message.reply({ content: res })
        }

        const res = bcdice_roll(message.content)
        if (res == null) return;

        const sys = res.system;
        let text = res.result.text;
        const emb = new EmbedBuilder()
            .setColor(res.result.success ? 0x0000FF : (res.result.failure ? 0xFF0000 : 0))
            .setDescription(text)
            .setTitle(res.system === "DiceBot" ? null : res.system);
        message.reply({ embeds: [emb] })
    } catch { }

})

client.on("interactionCreate", async (interaction) => {
    try {
        if (interaction.isAutocomplete()) {
            const focusedValue = interaction.options.getFocused();
            const list = systems.filter(x => x.id.includes(focusedValue) || x.name.includes(focusedValue)).filter((x, index) => index < 25)
            await interaction.respond(
                list.map(x => ({ name: `${x.name}(${x.id})`, value: x.id })),
            );
        }

        if (!interaction.isCommand()) {
            return;
        }
        await interaction.reply({ content: interaction.commandName });
    } catch { }

});


const TOKEN = process.env.TOKEN;
client.login(TOKEN)
