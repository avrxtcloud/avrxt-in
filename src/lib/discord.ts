
export async function checkDiscordRole(userId: string, providerToken?: string) {
    const guildId = process.env.DISCORD_GUILD_ID;
    const roleId = process.env.DISCORD_ROLE_ID;

    if (!guildId || !roleId) {
        console.error('[DISCORD_AUTH] Missing IDs: GUILD_ID or ROLE_ID not set in env.');
        return false;
    }

    if (providerToken) {
        try {
            console.log(`[DISCORD_AUTH] Attempting role check for user ${userId} in guild ${guildId} using User Token...`);
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
                const hasRole = data.roles && data.roles.includes(roleId);
                console.log(`[DISCORD_AUTH] Success! User roles: ${JSON.stringify(data.roles)}. Match found: ${hasRole}`);
                return hasRole;
            } else {
                const errorData = await response.text();
                console.error(`[DISCORD_AUTH] Discord API Error (User Token). Status: ${response.status}. Body: ${errorData}`);
                // If 403, it means the user hasn't authorized 'guilds.members.read' scope
                // If 404, the user is likely not in the guild at all
            }
        } catch (error) {
            console.error('[DISCORD_AUTH] Fetch Exception (User Token):', error);
        }
    }

    const botToken = process.env.DISCORD_TOKEN;
    if (botToken) {
        try {
            console.log('[DISCORD_AUTH] Falling back to Bot Token check...');
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
            console.error('[DISCORD_AUTH] Fetch Exception (Bot Token):', error);
        }
    } else {
        console.warn('[DISCORD_AUTH] No Bot Token available for fallback check.');
    }

    return false;
}
