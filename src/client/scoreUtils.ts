const UPPER_SECTION_INDICES = [0, 2, 4, 6, 8];

/**
 * Calculates all possible scores for the given dice values.
 * @param diceValues
 */
export const getAllPossibleScores = (diceValues: (number)[]): (number)[] => {
    const counts = Array(6).fill(0);
    diceValues.forEach(val => counts[val - 1]++);

    const total = diceValues.reduce((sum, d) => sum + d, 0);
    const unique = new Set(diceValues);

    const hasN = (n: number) => counts.some(c => c >= n);
    const hasFullHouse = counts.includes(3) && counts.includes(2);
    const hasSmallStraight = [0,1,2,3].some(i => counts.slice(i, i+4).every(c => c > 0));
    const hasLargeStraight = [0,1].some(i => counts.slice(i, i+5).every(c => c > 0));
    const isYahtzee = counts.some(c => c === 5);

    return [
        counts[0] * 1,
        hasThreeOfAKind(counts) ? total : 0,
        counts[1] * 2,
        hasFourOfAKind(counts) ? total : 0,
        counts[2] * 3,
        hasFullHouse ? 25 : 0,
        counts[3] * 4,
        hasSmallStraight ? 30 : 0,
        counts[4] * 5,
        hasLargeStraight ? 40 : 0,
        counts[5] * 6,
        isYahtzee ? 50 : 0,
        0,
        total,
    ];
};

const hasThreeOfAKind = (counts: number[]) => counts.some(c => c >= 3);
const hasFourOfAKind = (counts: number[]) => counts.some(c => c >= 4);

/**
 * Checks if the upper section qualifies for the 35-point bonus
 */
export const checkUpperBonus = (scores: (number | null)[]): boolean => {
    const upperTotal = UPPER_SECTION_INDICES.reduce((acc, idx) => {
        return acc + (scores[idx] ?? 0);
    }, 0);
    return upperTotal >= 63;
};
