
export async function checkDiscordRole(userId: string, providerToken?: string) {
    const guildId = process.env.DISCORD_GUILD_ID;
    const roleId = process.env.DISCORD_ROLE_ID;

    if (!guildId || !roleId) {
        console.error('Missing Discord configuration. Please ensure DISCORD_GUILD_ID and DISCORD_ROLE_ID are set.');
        return false;
    }

    // 1. Try checking via User's own Token (No Bot Required)
    if (providerToken) {
        try {
            const response = await fetch(
                `https://discord.com/api/v10/users/@me/guilds/${guildId}/member`,
                {
                    headers: {
                        Authorization: `Bearer ${providerToken}`,
                    },
                    next: { revalidate: 0 }
                }
            );

            if (response.ok) {
                const data = await response.json();
                return data.roles && data.roles.includes(roleId);
            }
            // If the user's token doesn't have the right scopes or failed, we continue to bot fallback
            console.warn('Discord User Token check failed, falling back to bot if available.');
        } catch (error) {
            console.error('Error checking Discord role with user token:', error);
        }
    }

    // 2. Fallback to Bot Token (If you set DISCORD_TOKEN)
    const botToken = process.env.DISCORD_TOKEN;
    if (botToken) {
        try {
            const response = await fetch(
                `https://discord.com/api/v10/guilds/${guildId}/members/${userId}`,
                {
                    headers: {
                        Authorization: `Bot ${botToken}`,
                    },
                    next: { revalidate: 0 }
                }
            );

            if (response.ok) {
                const data = await response.json();
                return data.roles && data.roles.includes(roleId);
            }
        } catch (error) {
            console.error('Error checking Discord role with bot token:', error);
        }
    }

    return false;
}
