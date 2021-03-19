import Evaluation from './evaluation';
import Perspectives from './perspective';

const scores = [...Evaluation].sort((a, b) => b.value - a.value);

export function matchScore(score: number) {
  let credit: string = '0';
  scores.some(s => {
    if (score >= s.value) {
      credit = s.score;
      return true;
    }
    return false;
  });
  return credit;
}

export function calcScores(scores: { [key: string]: number }) {
  const account = Perspectives.reduce((sum, p) => {
    const score = scores[p.key];
    return score ? sum + p.weight : sum;
  }, 0);
  const average = Perspectives.reduce((sum, p) => {
    const score = scores[p.key];
    return score ? sum + (p.weight / account) * score : sum;
  }, 0);
  return average;
}
