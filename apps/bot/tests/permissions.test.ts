import { hasPermission, DISCORD_PERMISSIONS } from '@hugebot/shared';

describe('Discord Permissions Evaluator', () => {
  it('should grant access if ADMINISTRATOR bit is set regardless of specific permission', () => {
    const adminBitmask = DISCORD_PERMISSIONS.ADMINISTRATOR.toString();
    expect(hasPermission(adminBitmask, DISCORD_PERMISSIONS.BAN_MEMBERS)).toBe(true);
    expect(hasPermission(adminBitmask, DISCORD_PERMISSIONS.MANAGE_CHANNELS)).toBe(true);
  });

  it('should grant access if explicit BAN_MEMBERS bit is present', () => {
    const banOnlyBitmask = DISCORD_PERMISSIONS.BAN_MEMBERS.toString();
    expect(hasPermission(banOnlyBitmask, DISCORD_PERMISSIONS.BAN_MEMBERS)).toBe(true);
    expect(hasPermission(banOnlyBitmask, DISCORD_PERMISSIONS.KICK_MEMBERS)).toBe(false);
  });
});
