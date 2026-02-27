
export async function checkDiscordRole(userId: string) {
    const guildId = process.env.DISCORD_GUILD_ID;
    const roleId = process.env.DISCORD_ROLE_ID;
    const botToken = process.env.DISCORD_TOKEN;

    if (!guildId || !roleId || !botToken) {
        console.error('Missing Discord configuration. Please ensure DISCORD_GUILD_ID, DISCORD_ROLE_ID, and DISCORD_TOKEN are set.');
        return false;
    }

    try {
        const response = await fetch(
            `https://discord.com/api/v10/guilds/${guildId}/members/${userId}`,
            {
                headers: {
                    Authorization: `Bot ${botToken}`,
                },
                next: { revalidate: 0 } // Ensure we always get fresh data
            }
        );

        if (!response.ok) {
            console.error(`Discord API responded with status: ${response.status}`);
            return false;
        }

        const data = await response.json();
        
        // Discord API returns an array of role IDs for the member
        return data.roles && data.roles.includes(roleId);
    } catch (error) {
        console.error('Error checking Discord role:', error);
        return false;
    }
}
