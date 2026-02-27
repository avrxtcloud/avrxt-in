
export async function checkDiscordRole(userId: string, providerToken?: string) {
    const guildId = process.env.DISCORD_GUILD_ID?.trim();
    const roleId = process.env.DISCORD_ROLE_ID?.trim();

    if (!guildId || !roleId) {
        console.error('[DISCORD_AUTH] Missing IDs: Ensure GUILD_ID and ROLE_ID are set in env.');
        return false;
    }

    if (providerToken) {
        try {
            console.log(`[DISCORD_AUTH] Checking Guild: ${guildId} | Role: ${roleId} | User: ${userId}`);

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
                const userRoles: string[] = data.roles || [];
                const hasRole = userRoles.includes(roleId);

                console.log(`[DISCORD_AUTH] Success! Discord reported roles: ${userRoles.join(', ')}`);
                console.log(`[DISCORD_AUTH] Match Found (${roleId}): ${hasRole}`);

                return hasRole;
            } else {
                const errorData = await response.text();
                if (response.status === 404) {
                    console.error(`[DISCORD_AUTH] User ${userId} is NOT a member of Guild ${guildId}.`);
                } else if (response.status === 403) {
                    console.error(`[DISCORD_AUTH] Token missing 'guilds.members.read' scope or permission denied.`);
                } else {
                    console.error(`[DISCORD_AUTH] Discord API Error: ${response.status} - ${errorData}`);
                }
            }
        } catch (error) {
            console.error('[DISCORD_AUTH] Connection error during check:', error);
        }
    }

    // Fallback: Bot Token
    const botToken = process.env.DISCORD_TOKEN?.trim();
    if (botToken) {
        try {
            console.log('[DISCORD_AUTH] Falling back to Bot Token verification...');
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
            console.error('[DISCORD_AUTH] Bot Token connection error:', error);
        }
    }

    return false;
}
