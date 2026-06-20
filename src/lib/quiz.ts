const personalities = ["温柔观察家", "快乐显眼包", "高冷指挥官", "忠诚守护者", "好奇探险家"];
const careers = ["星际零食鉴定师", "银河治愈官", "地球巡逻队长", "梦境导航员", "宇宙气氛组组长"];
const rarities = ["SSR·星芒限定", "SR·月光珍藏", "UR·宇宙唯一", "SSR·彩虹典藏"];
const guardians = ["白鲸", "雪豹", "赤狐", "海豚", "金雕"];
const values = ["88.8万罐罐", "128万根小鱼干", "520万枚星币", "无价之宝"];

export function buildQuizResult(petName: string, answers: number[]) {
  const total = answers.reduce((sum, answer) => sum + answer, 0);
  const nameScore = Array.from(petName).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const seed = total + nameScore;

  return {
    personality: personalities[seed % personalities.length],
    career: careers[(seed + answers[2] * 3) % careers.length],
    rarity: rarities[(seed + answers[5]) % rarities.length],
    guardian: guardians[(seed + answers[7] * 2) % guardians.length],
    netWorth: values[(seed + total) % values.length],
    matchScore: 82 + (seed % 17),
  };
}
