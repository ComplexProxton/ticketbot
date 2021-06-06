const Discord = require('discord.js');
const client = new Discord.Client({partials: ["MESSAGE", "USER", "REACTION"]});
const enmap = require('enmap');
const {prefix} = require('./config.json');

const settings = new enmap({
    name: "settings",
    autoFetch: true,
    cloneLevel: "deep",
    fetchAll: true
});


/**
 * Client Events
 */
client.on("ready", () => {
  console.log(`${client.user.username} ready!`);
  client.user.setActivity(`Atlantis Kingdom`, { type: "COMPETING"}); });
client.on("warn", (info) => console.log(info));
client.on("error", console.error);



client.on('message', async message => {
    if(message.author.bot) return;
    if(message.content.indexOf(prefix) !== 0) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if(command == "ticket-setup") {
        // ticket-setup #channel

        let channel = message.mentions.channels.first();
        if(!channel) return message.reply("usage: `;ticket-setup #channel`");

        let sent = await channel.send(new Discord.MessageEmbed()
            .setTitle("Atlantis Kingdom Support Tickets")
            .setDescription("React to open a ticket and get staff assitance.")
            .setFooter("Bot Created by Arxel🌀#0001")
            
            .setColor("#2f3136")
        );

        sent.react('🎫');
        settings.set(`${message.guild.id}-ticket`, sent.id);

        message.channel.send("ticket system setup done !")
    }

    if(command == "close") {
        if(!message.channel.name.includes("ticket-")) return message.channel.send("oops, you cannot use that here !")
        message.channel.delete();
    }
});

client.on('messageReactionAdd', async (reaction, user) => {
    if(user.partial) await user.fetch();
    if(reaction.partial) await reaction.fetch();
    if(reaction.message.partial) await reaction.message.fetch();

    if(user.bot) return;

    let ticketid = await settings.get(`${reaction.message.guild.id}-ticket`);

    if(!ticketid) return;

    if(reaction.message.id == ticketid && reaction.emoji.name == '🎫') {
        reaction.users.remove(user);

        reaction.message.guild.channels.create(`ticket-${user.username}`, {
            permissionOverwrites: [
                {
                    id: user.id,
                    allow: ["SEND_MESSAGES", "VIEW_CHANNEL"]
                },
                {
                    id: reaction.message.guild.roles.everyone,
                    deny: ["VIEW_CHANNEL"]
                }
            ],
            type: 'text'
        }).then(async channel => {
            channel.send(`<@${user.id}> <@&839091360967032840> A New ticket has been created!`, 
new Discord.MessageEmbed().setTitle("Welcome to your support system ticket!")
.setDescription("Kingdom Guards Will be with you shortly. In the mean time please describe your problem/issue in detail so we can respond faster! If this ticket was created with no purpose you will be warned.")
.setColor("#2f3136"))
        })
    }
});

client.login(process.env.TOKEN);
