import Evaluation from './score.json';
import Perspectives from './perspective.json';

const scores = [...Evaluation].sort((a, b) => b.value - a.value);

// baseline 是每一档分数与比其第一档的分数的平均值，用来卡合格线
// 用 baseline 卡比直接落区间更合理，否则 3、3、3、2.5+ 就一定到不了 3
const baselines = scores.map((s, index, arr) => {
  const baseline =
    index !== arr.length - 1 ? (s.value + arr[index + 1].value) / 2 : s.value;
  console.log(`baseline of '${s.score}'(${s.value}) is '${baseline}'`);
  return {
    ...s,
    baseline,
  };
});

export function matchScore(score: number) {
  console.log('>>> matching..');
  let credit: string = '0';
  // 从最高分开始卡，卡到的一个分数段即是得分
  baselines.some(base => {
    if (score >= base.baseline) {
      credit = base.score;
      console.log(`find first matching: '${base.score}'(${base.value})`);
      return true;
    }
    return false;
  });
  console.log('>>> matching done!');
  return credit;
}

export function calcScores(scores: { [key: string]: number }) {
  console.log('>>> weighting..');
  // 先要算权重的总重，原因是当某些项目没有打分时，这些未考察的权重不应被计入（ 是没打分不是打零分 ）
  // 因此先要过一遍项目得分，将有分的权重加和，得到总重
  const account = Perspectives.reduce((sum, p) => {
    const score = scores[p.key];
    if (!score) {
      // tip for none score perspective
      console.log(`'${p.key}' has no score, ignored`);
    }
    return score ? sum + p.weight : sum;
  }, 0);
  console.log(`sum account is '${account}'`);
  // 在计算加权和时，每一项的实际权重为预设权重与实际总重的比例
  // 例如只有一项 0.4 被评估时，实际权重是 0.4 / 0.4 = 1
  // 再例如有 0.4 和 0.1 两项被评估时，0.4 的实际权重是 0.4 / (0.4 + 0.1) = 0.8
  const average = Perspectives.reduce((sum, p) => {
    const score = scores[p.key];
    const weighted = (p.weight / account) * score;
    if (weighted) {
      console.log(`'${p.key}' has a weighted score: '${weighted}'`);
    }
    return sum + weighted;
  }, 0);
  console.log(`>>> weighting done! final score is '${average}'`);
  return average;
}
