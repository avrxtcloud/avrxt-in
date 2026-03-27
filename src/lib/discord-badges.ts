export type DiscordBadgeDefinition = {
  id: string;
  label: string;
  src: string;
  bit?: number;
  // Nitro / collectibles / quests aren't represented by public_flags.
  detection?: 'nitro' | 'orb' | 'quest';
};

export const DISCORD_BADGES: DiscordBadgeDefinition[] = [
  { id: 'staff', label: 'Discord Staff', src: '/discord/badges/discordstaff.svg', bit: 1 << 0 },
  { id: 'partner', label: 'Partnered Server Owner', src: '/discord/badges/discordpartner.svg', bit: 1 << 1 },
  { id: 'hypesquad_events', label: 'HypeSquad Events', src: '/discord/badges/hypesquadevents.svg', bit: 1 << 2 },
  { id: 'bug_hunter_1', label: 'Bug Hunter', src: '/discord/badges/discordbughunter1.svg', bit: 1 << 3 },
  { id: 'hypesquad_bravery', label: 'HypeSquad Bravery', src: '/discord/badges/hypesquadbravery.svg', bit: 1 << 6 },
  { id: 'hypesquad_brilliance', label: 'HypeSquad Brilliance', src: '/discord/badges/hypesquadbrilliance.svg', bit: 1 << 7 },
  { id: 'hypesquad_balance', label: 'HypeSquad Balance', src: '/discord/badges/hypesquadbalance.svg', bit: 1 << 8 },
  { id: 'early_supporter', label: 'Early Supporter', src: '/discord/badges/discordearlysupporter.svg', bit: 1 << 9 },
  { id: 'bug_hunter_2', label: 'Bug Hunter (Gold)', src: '/discord/badges/discordbughunter2.svg', bit: 1 << 14 },
  { id: 'early_verified_bot_dev', label: 'Early Verified Bot Developer', src: '/discord/badges/discordbotdev.svg', bit: 1 << 17 },
  { id: 'certified_moderator', label: 'Certified Moderator', src: '/discord/badges/discordmod.svg', bit: 1 << 18 },
  { id: 'interactions', label: 'Bot HTTP Interactions', src: '/discord/badges/supportscommands.svg', bit: 1 << 19 },
  { id: 'active_developer', label: 'Active Developer', src: '/discord/badges/activedeveloper.svg', bit: 1 << 22 },

  { id: 'nitro', label: 'Discord Nitro', src: '/discord/badges/discordnitro.svg', detection: 'nitro' },
  { id: 'orb', label: "Collected Orb", src: '/discord/badges/orb.svg', detection: 'orb' },
  { id: 'quest', label: 'Completed a Quest', src: '/discord/badges/quest.png', detection: 'quest' },
];

