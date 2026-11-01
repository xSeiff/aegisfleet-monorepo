import { prisma } from '@hugebot/database';

export interface GambleResult {
  won: boolean;
  payout: bigint;
  netGain: bigint;
  details: string;
}

export class GalaxyCasinoEconomy {
  public async coinflip(userId: string, bet: bigint, choice: 'heads' | 'tails'): Promise<GambleResult> {
    const account = await this.ensureAccount(userId);
    if (account.wallet < bet) {
      throw new Error(`Insufficient funds. Your wallet has 🪙 ${account.wallet.toLocaleString()}.`);
    }

    const outcome = Math.random() < 0.5 ? 'heads' : 'tails';
    const won = outcome === choice;
    const payout = won ? bet * 2n : 0n;
    const netGain = won ? bet : -bet;

    await prisma.economyAccount.update({
      where: { userId },
      data: { wallet: { increment: netGain } },
    });

    return {
      won,
      payout,
      netGain,
      details: `Flipped: **${outcome.toUpperCase()}**! You ${won ? 'won!' : 'lost your bet.'}`,
    };
  }

  public async slots(userId: string, bet: bigint): Promise<GambleResult> {
    const account = await this.ensureAccount(userId);
    if (account.wallet < bet) {
      throw new Error(`Insufficient funds. Your wallet has 🪙 ${account.wallet.toLocaleString()}.`);
    }

    const symbols = ['🍒', '🍋', '🍇', '💎', '7️⃣'];
    const r1 = symbols[Math.floor(Math.random() * symbols.length)];
    const r2 = symbols[Math.floor(Math.random() * symbols.length)];
    const r3 = symbols[Math.floor(Math.random() * symbols.length)];

    let multiplier = 0n;
    if (r1 === r2 && r2 === r3) {
      multiplier = r1 === '7️⃣' ? 10n : r1 === '💎' ? 5n : 3n;
    } else if (r1 === r2 || r2 === r3 || r1 === r3) {
      multiplier = 1n; // refund/even
    }

    const won = multiplier > 0n;
    const payout = bet * multiplier;
    const netGain = payout - bet;

    await prisma.economyAccount.update({
      where: { userId },
      data: { wallet: { increment: netGain } },
    });

    return {
      won,
      payout,
      netGain,
      details: `[ ${r1} | ${r2} | ${r3} ] — ${multiplier > 1n ? `JACKPOT ${multiplier}x!` : multiplier === 1n ? 'Break even!' : 'No match.'}`,
    };
  }

  public async transfer(senderId: string, recipientId: string, amount: bigint, taxRate = 0.05): Promise<{ sent: bigint; tax: bigint; received: bigint }> {
    const sender = await this.ensureAccount(senderId);
    if (sender.wallet < amount) {
      throw new Error('Insufficient wallet funds for this transfer.');
    }

    await this.ensureAccount(recipientId);
    const tax = BigInt(Math.floor(Number(amount) * taxRate));
    const received = amount - tax;

    await prisma.$transaction([
      prisma.economyAccount.update({
        where: { userId: senderId },
        data: { wallet: { decrement: amount } },
      }),
      prisma.economyAccount.update({
        where: { userId: recipientId },
        data: { wallet: { increment: received } },
      }),
    ]);

    return { sent: amount, tax, received };
  }

  private async ensureAccount(userId: string) {
    await prisma.user.upsert({
      where: { id: userId },
      create: { id: userId, username: `user_${userId.slice(0, 4)}` },
      update: {},
    });

    return prisma.economyAccount.upsert({
      where: { userId },
      create: { userId, wallet: 1000n, bank: 0n },
      update: {},
    });
  }
}
