export async function checkDiscordRole(accessToken: string, guildId: string, roleId: string): Promise<{ authorized: boolean; error?: string }> {
  try {
    const response = await fetch(`https://discord.com/api/users/@me/guilds/${guildId}/member`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { authorized: false, error: 'Not a member of the guild' };
      }
      return { authorized: false, error: `Discord API error: ${response.statusText}` };
    }

    const member = await response.json();
    const roles = member.roles as string[];

    if (roles.includes(roleId)) {
      return { authorized: true };
    }

    return { authorized: false, error: 'Missing required role' };
  } catch (error) {
    console.error('Discord RBAC check error:', error);
    return { authorized: false, error: 'Internal error checking Discord role' };
  }
}
