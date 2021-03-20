import Evaluation from './score.json';
import Perspectives from './perspective.json';

export const SortedScores = [...Evaluation].sort((a, b) => b.value - a.value);

// baseline 是每一档分数与比其低一档的分数的平均值，用来卡合格线
// 用 baseline 卡比直接落区间更合理，否则 3、3、3、2.5+ 就一定到不了 3
export const Baselines = SortedScores.map((s, index, arr) => {
  const baseline =
    index !== arr.length - 1 ? (s.value + arr[index + 1].value) / 2 : s.value;
  console.log(`'${s.score}'(${s.value}) 的合格线是 '${baseline}'`);
  return {
    ...s,
    baseline,
  };
});

export function matchScore(score: number) {
  console.log('>>> 正在匹配..');
  let credit: string = '0';
  // 从最高分开始卡，卡到的一个分数段即是得分
  Baselines.some(base => {
    if (score >= base.baseline) {
      credit = base.score;
      console.log(`匹配到得分 '${base.score}'(${base.value})`);
      return true;
    }
    return false;
  });
  console.log('>>> 匹配结束！');
  return credit;
}

export function calcScores(scores: { [key: string]: number }) {
  console.log('>>> 正在计算..');
  // 先要算权重的总重，原因是当某些项目没有打分时，这些未考察的权重不应被计入（ 是没打分不是打零分 ）
  // 因此先要过一遍项目得分，将有分的权重加和，得到总重
  const account = Perspectives.reduce((sum, p) => {
    const score = scores[p.key];
    if (!score) {
      // tip for none score perspective
      console.log(`'${p.title}' 未考察, 不会被计入`);
    }
    return score ? sum + p.weight : sum;
  }, 0);
  console.log(`实际总重为 '${account}'`);
  // 在计算加权和时，每一项的实际权重为预设权重与实际总重的比例
  // 例如只有一项 0.4 被评估时，实际权重是 0.4 / 0.4 = 1
  // 再例如有 0.4 和 0.1 两项被评估时，0.4 的实际权重是 0.4 / (0.4 + 0.1) = 0.8
  const average = Perspectives.reduce((sum, p) => {
    const score = scores[p.key];
    const weighted = account ? (p.weight / account) * score : 0;
    console.log(`'${p.title}' 的实际加权得分为 '${weighted}'`);
    return sum + weighted;
  }, 0);
  console.log(`>>> 计算结束！最终得分为 '${average}'`);
  return average;
}
