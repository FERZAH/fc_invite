const guildInvites = require('./models/guildInvites');
const members = require('./models/members');
const { connect, connection } = require('mongoose');

async function InviteManager(options) {
    const client = options.client;
    const mongoURL = options.mongoURL;
    if (!client) throw new Error('InviteManager: client is not defined');
    if (!mongoURL) throw new Error('InviteManager: mongoURL is not defined');
    if (client.guilds.size <= 0) throw new Error('InviteManager: client is not connected to any guilds');
    connect(mongoURL);
    connection.on('error', (err) => {
        throw new Error(`InviteManager: ${err}`);
    });
    client.on('ready', async () => {
        client.guilds.cache.forEach(async (guild) => {
            const bot = guild.members.cache.get(client.user.id);
            if (!bot.permissions.has('ADMINISTRATOR')) return;
            const inviteData = await guildInvites.findOne({ guildID: guild.id });
            const memberData = await members.findOne({ guildID: guild.id });
            const fetchedInvites = await guild.invites.fetch();
            if (!inviteData && !memberData) {
                await guild.invites.fetch().then(invites => {
                    new guildInvites({
                        guildID: guild.id,
                        invites: new Map(invites.map(invite => [invite.code, invite.uses]))
                    }).save();
                });
                new members({
                    guildID: guild.id,
                }).save();
            } else {
                await guildInvites.findOneAndUpdate({ guildID: guild.id }, { $set: { invites: new Map(fetchedInvites.map(invite => [invite.code, invite.uses])) } }, { upsert: true });
            }
        });
    });

    client.on('inviteCreate', async (invite) => {
        const inviteData = await guildInvites.findOne({ guildID: invite.guild.id });
        if (!inviteData) {
            await invite.guild.invites.fetch().then(invites => {
                new guildInvites({
                    guildID: invite.guild.id,
                    invites: new Map(invites.map(inv => [inv.code, inv.uses]))
                }).save();
            });
            return;
        }
        inviteData.invites.set(invite.code, invite.uses);
        await inviteData.save();
    });
    client.on('inviteDelete', async (invite) => {
        const inviteData = await guildInvites.findOne({ guildID: invite.guild.id });
        if (!inviteData) {
            await invite.guild.invites.fetch().then(invites => {
                new guildInvites({
                    guildID: invite.guild.id,
                    invites: new Map(invites.map(inv => [inv.code, inv.uses]))
                }).save();
            });
            return;
        }
        inviteData.invites.delete(invite.code);
        await inviteData.save();
    });
    client.on('guildMemberAdd', async (member) => {
        const inviteData = await guildInvites.findOne({ guildID: member.guild.id });
        const memberData = await members.findOne({ guildID: member.guild.id });
        if (!inviteData) {
            await member.guild.invites.fetch().then(invites => {
                new guildInvites({
                    guildID: member.guild.id,
                    invites: new Map(invites.map(inv => [inv.code, inv.uses]))
                }).save();
            });
            return;
        }
        const newInvites = await member.guild.invites.fetch();
        const invite = newInvites.filter(inv => inv.uses != inviteData.invites.get(inv.code)).first() || { code: member.guild.vanityURLCode, uses: 0 };
        if (invite && !invite.code) return;
        const inviter = (invite.code == member.guild.vanityURLCode) ? { user: { tag: member.guild.name, id: member.guild.vanityURLCode }, id: member.guild.vanityURLCode } : member.guild.members.cache.get(invite.inviter.id);
        client.emit('memberJoin', member, inviter, invite);
        if (invite.code) {
            inviteData.invites.set(invite.code, invite.uses);
            await inviteData.save();
        }
        if (!memberData) {
            new members({
                guildID: member.guild.id,
            }).save().then(async (s) => {
                s.members.set(member.id, { inviter: inviter, invite: invite });
                await s.save();
            });
        } else {
            memberData.members.set(member.id, { inviter: inviter, invite: invite });
            await memberData.save();
        }
    });
    client.on('guildMemberRemove', async (member) => {
        const inviteData = await guildInvites.findOne({ guildID: member.guild.id });
        const memberData = await members.findOne({ guildID: member.guild.id });
        if (!inviteData) return;
        if (!memberData) return;
        const data = memberData.members.get(member.id);
        if (!data) return;
        const invite = data.invite;
        const inviter = data.inviter == member.guild.vanityURLCode ? { user: { tag: member.guild.name, id: member.guild.vanityURLCode }, id: member.guild.vanityURLCode } : member.guild.members.cache.get(data.inviter);
        if (!inviter) return;
        client.emit('memberLeave', member, inviter, invite);
        memberData.members.delete(member.id);
        await memberData.save();
    });
}

exports.InviteManager = InviteManager; // Ferzah ❤️ Cross
