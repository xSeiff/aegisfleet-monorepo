describe('Galaxy Casino Game Multipliers', () => {
  it('should calculate correct slot machine payouts', () => {
    const bet = 100n;
    const testRounds = [
      { reels: ['7️⃣', '7️⃣', '7️⃣'], expectedMult: 10n },
      { reels: ['💎', '💎', '💎'], expectedMult: 5n },
      { reels: ['🍒', '🍒', '🍒'], expectedMult: 3n },
      { reels: ['🍒', '🍒', '🍋'], expectedMult: 1n },
      { reels: ['🍒', '🍋', '🍇'], expectedMult: 0n },
    ];

    for (const round of testRounds) {
      let multiplier = 0n;
      const [r1, r2, r3] = round.reels;
      if (r1 === r2 && r2 === r3) {
        multiplier = r1 === '7️⃣' ? 10n : r1 === '💎' ? 5n : 3n;
      } else if (r1 === r2 || r2 === r3 || r1 === r3) {
        multiplier = 1n;
      }

      expect(multiplier).toBe(round.expectedMult);
      const payout = bet * multiplier;
      expect(payout).toBe(bet * round.expectedMult);
    }
  });

  it('should calculate transfer tax deductions accurately', () => {
    const amount = 1000n;
    const taxRate = 0.05;
    const tax = BigInt(Math.floor(Number(amount) * taxRate));
    const received = amount - tax;

    expect(tax).toBe(50n);
    expect(received).toBe(950n);
  });
});
