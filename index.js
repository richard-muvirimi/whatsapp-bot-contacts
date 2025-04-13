const wa = require('@open-wa/wa-automate');
const fs = require('node:fs');
const path = require('node:path');
const sanitize = require("sanitize-filename");
const { createObjectCsvWriter } = require('csv-writer-portable');
const _ = require('lodash');
const onDeath = require("ondeath");
const md5 = require('md5');

wa.create({
    sessionId: "WHATSAPP_HELPER",
    multiDevice: true, //required to enable multiDevice support
    authTimeout: 1000, //wait only 60 seconds to get a connection with the host account device
    blockCrashLogs: true,
    disableSpins: true,
    headless: true,
    hostNotificationLang: 'PT_BR',
    logConsole: false,
    popup: true,
    useChrome: true,
    sessionDataPath: path.join(__dirname, 'sessions'),
    qrTimeout: 0, //0 means it will wait forever for you to scan the qr code
}).then(client => start(client));

fs.mkdirSync(__dirname + "/chats/", { recursive: true });

function parseNumber(numberId) {
    const regex = new RegExp("^(\\d+)(?:-(\\d+))?.*", 'g');

    const [_, number, groupId] = regex.exec(numberId.replace(/[+\s]/g, ''));

    return { number, groupId, isGroup: groupId !== null, isDirect: groupId === null };
}

function start(client) {
    client.onMessage(async message => {

        if (message.isGroupMsg) {
            return;
        }

        console.log(message.from);

        if (message.body === 'Hi SMS X!') {
            await client.sendText(message.from, '👋 Hello! I can help you manage WhatsApp groups. Here are some commands you can use:\n\n' +
                '#command - Get a list of all available commands\n' +
                '#groups - Get a list of groups you share with me\n' +
                '#group-<id> - Get the members list of a specific group (e.g., #group-1234 - note: no space between #group and -1234)\n\n' +
                'Add me to a group to get started!');
        }

        if (message.body === '#help') {
            await client.sendText(message.from, 'Here are some commands you can use:\n\n' +
                '#command - Get a list of all available commands\n' +
                '#groups - Get a list of groups you share with me\n' +
                '#group-<id> - Get the members list of a specific group (e.g., #group-1234 - note: no space between #group and -1234)\n\n' +
                'Add me to a group to get started!');
        }

        if (message.body === '#command') {    
            await client.sendText(message.from, 'Here are the commands you can use:\n\n' +
                '#groups - Get a list of groups you share with me\n' +
                '#group-<id> - Get the members list of a specific group (e.g., #group-1234 - note: no space between #group and -1234)\n' +
                '#help - Get help with commands\n\n' +
                'Add me to a group to get started!');
        }

        if (message.body === '#groups') {
            try {
                const groups = await client.getAllGroups();
                const shared = await Promise.all(
                    groups.map(async group => {
                        const members = await client.getGroupMembers(group.id);
                        const senderPresent = members.find(contact => parseNumber(message.from).number === parseNumber(contact.id).number);
                        const botPresent = members.find(contact => contact.isMe);
                        return senderPresent && botPresent ? group : null;
                    })
                ).then(groups => groups.filter(group => group !== null));
          
                const data = shared
                    .map((chat) => md5(chat.id).slice(0, 4).toUpperCase() + ". " + sanitize(chat.name))
                    .join('\n');

                await client.sendText(message.from, `Here are the groups you share with me:\n\n${data}\n\n` +
                    'To get the members list of a group, send #group-<id> where <id> is the 4-letter code before the group name.\n' +
                    'Important: There should be no space between #group and -<id>.\n' +
                    'For example, if you want the members list of group "1234. Group Name", send #group-1234');

            } catch (error) {
                await client.sendText(message.from, 'Failed to get groups. Please try again later.');
            }
        }

        if (message.body.match(/^#group-\w{4}$/)) {
            const index = message.body.replace('#group-', '').trim().toLowerCase();
            const groups = await client.getAllGroups();
            const chat = groups.find(chat => md5(chat.id).startsWith(index)) || null;

            if (!chat) {
                await client.sendText(message.from, 'Group not found. Please check the group ID and try again.\n' +
                    'Important: Make sure there are no spaces between #group and -<id>.\n' +
                    'You can get the correct group ID by sending #groups first.');
                return;
            }

            const members = await client.getGroupMembers(chat.id)
            const contacts = members.filter(contact => !contact.isMe)

            const filePath = path.join(__dirname, 'chats', md5(chat.name) + '-members.csv');

            try {
                const csvWriter = createObjectCsvWriter({
                    path: filePath,
                    header: [{ id: 'number', title: 'Phone Number' }],
                    alwaysQuote: true
                });

                const records = _.map(contacts, contact => {
                    const {number} = parseNumber(contact.id);
                    return { number };
                }).filter(contact => contact.number !== null);

                await csvWriter.writeRecords(records);
                
                await client.sendFile(message.from, filePath, sanitize(chat.name, { replacement: (char) => char.replace(/\W/g, '') }) + '-members.csv');
                await client.sendText(message.from, `I've sent you a CSV file with all the members of "${chat.name}". You can open it in any spreadsheet program.`);

            } catch (error) {
                await client.sendText(message.from, 'Failed to get members of the group. Please try again later.');
            } finally {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
        }

        await client.simulateTyping(message.from, false);
    });

    onDeath(() => {

        client.kill();
        fs.rmdirSync(__dirname + "/chats/", { recursive: true });

        process.exit(0);
    });

}

console.log("Starting...");