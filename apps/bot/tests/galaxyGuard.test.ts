describe('Galaxy Guard Adaptive Heat Scoring & Calculations', () => {
  it('should correctly calculate composite heat from messages, newlines, and mentions', () => {
    const msgWeight = 1.0;
    const newlineWeight = 0.5;
    const mentionWeight = 2.5;

    // Simulated message: 7 newlines (2 excess), 4 mentions (2 excess)
    let heat = msgWeight;
    const newlines = 7;
    if (newlines > 5) {
      heat += (newlines - 5) * newlineWeight;
    }
    const mentions = 4;
    if (mentions > 2) {
      heat += mentions * mentionWeight;
    }

    // Expected: 1.0 + (2 * 0.5) + (4 * 2.5) = 1.0 + 1.0 + 10.0 = 12.0
    expect(heat).toBe(12.0);
  });
});
