[![github](https://img.shields.io/badge/Github%20-1d202b.svg?&style=for-the-badge&logo=github&logoColor=white)](https://github.com/FERZAH/fc_invite)
[![supportServer](https://img.shields.io/badge/Discord%20-7289DA.svg?&style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/2011)
[![totalDownloads](https://img.shields.io/npm/dt/fc_invite?color=CC3534&logo=npm&style=for-the-badge)](http://npmjs.com/fc_invite)
[![weeklyDownloads](https://img.shields.io/npm/dw/fc_invite?color=CC3534&logo=npm&style=for-the-badge)](http://npmjs.com/fc_invite)
[![version](https://img.shields.io/npm/v/fc_invite?color=red&label=Version&logo=npm&style=for-the-badge)](http://npmjs.com/fc_invite)
[![stars](https://img.shields.io/github/stars/FERZAH/fc_invite?color=yellow&logo=github&style=for-the-badge)](https://github.com/FERZAH/fc_invite)

## FC Invite

Discord.JS v13 invite modülü.

## İndirme:

    $ npm install fc_invite

## Not:
* Modül MongoDB ile çalıştığı için url almalısınız.
    - [Bilgilendirici video](https://www.youtube.com/watch?v=VKRIz9s9V70)'yu izleyerek alabilirsiniz.

## Parameters:

`member` -> Davet edilen kullanıcı. [GuildMember]

`inviter` -> Davet eden kişi. [GuildMember]

`invite` -> Daveti verir. [Invite]

## Client ve Intents:
<pre><code>const { Client, Intents } = require('discord.js');
const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_INVITES],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'ROLE', "GUILD_MEMBER", "USER", "GUILD_INVITES", "MANAGE_GUILD"],
});
//modül tanımlama
const { InviteManager } = require('fc_invite');
InviteManager({ client: client, mongoURL: process.env.mongoURL });</pre></code>

`guildMemberAdd` => `memberJoin`
`guildMemberRemove` => `memberLeave`

## Kullanım:
<pre><code>client.on('memberJoin', async (member, inviter, invite) => {
    console.log(`${member.user.tag} giriş yaptı, davet eden: ${inviter.user.tag} davet kodu: ${invite.code}.`);
});

client.on('memberLeave', async (member, inviter, invite) => {
    console.log(`${member.user.tag} çıkış yaptı, davet eden: ${inviter.user.tag}.`);
});</pre></code>

# Sıkça Sorulan Sorular (SSS) / Alınan Hatalar
* `Kullanıcı sunucu özel daveti ile katılırsa ne olur?` Özel davet ile katılırsa `member.user.tag` size sunucu ismini `invite.code` ise özel url'yi verir.
* `MongoDB URL nasıl alabilirim?` [Bilgilendirici video](https://www.youtube.com/watch?v=VKRIz9s9V70)'yu izleyerek alabilirsiniz.

# İLETİŞİM
* Herhangi bir hata veya soru için [Ferzah](https://discord.com/users/564900904713846785) veya [Cross](https://discord.com/users/641256228101554188)'a ulaşabilirsiniz.
