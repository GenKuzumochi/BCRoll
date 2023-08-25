import { Message, Client, GatewayIntentBits, SlashCommandBuilder, REST, IntentsBitField, EmbedBuilder } from 'discord.js'
import dotenv from 'dotenv'
import { bcdice_roll, systems } from './bcdice'
import {readdir,readFile} from "node:fs/promises";
import { UserDefinedDiceTable } from 'bcdice';

dotenv.config()

const client = new Client({
    intents: [GatewayIntentBits.Guilds, IntentsBitField.Flags.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
})

let userdefinedList : string[] = [];
client.once("ready", async () => {
    try{
        userdefinedList = await readdir("userdefined")
    }catch(_){
        userdefinedList = [];
    }
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

        if(message.content.startsWith("!rgba")){
            const rgb = Math.floor(Math.random() * 255 * 255 * 255);
            const alpha = Math.floor(Math.random() * 255);
            const code = "#" + rgb.toString(16).padStart(6,"0") + alpha.toString(16).padStart(2,"0");
            const emb = new EmbedBuilder()
            .setColor(rgb).setTitle(code!);
            message.reply({embeds:[emb]})
        }else if(message.content.startsWith("!rgb")){
            const rgb = Math.floor(Math.random() * 255 * 255 * 255);
            const code = "#" + rgb.toString(16).padStart(6,"0");
            const emb = new EmbedBuilder()
            .setColor(rgb).setTitle(code!);
            message.reply({embeds:[emb]})
        }else if(message.content.startsWith("!")){
            const cmd = message.content.substring(1).split(/\W/)[0]
            for(const c of userdefinedList) { 
                if( c === cmd) {
                    const file = await readFile("userdefined/" + cmd)
                    const data = file.toString("utf8")
                    const u = new UserDefinedDiceTable(data)
                    const result = u.roll()
                    message.reply({ content: result?.text })
                }
            }
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
