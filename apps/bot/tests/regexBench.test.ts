describe('AutoMod Regex Heuristic Benchmark', () => {
  const nitroScamRegex = /(discord-app\.net|nitro-drop\.com|discorcd\.gift)/i;

  it('should detect malicious phishing domains in under 1ms', () => {
    const payload = 'Get free Discord Nitro here: https://discorcd.gift/free-sub';
    const start = process.hrtime.bigint();
    const isPhish = nitroScamRegex.test(payload);
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1_000_000;

    expect(isPhish).toBe(true);
    expect(durationMs).toBeLessThan(1.0);
  });

  it('should pass legitimate discord messages without false positives', () => {
    const payload = 'Check out the official docs at https://discord.com/developers';
    expect(nitroScamRegex.test(payload)).toBe(false);
  });
});
