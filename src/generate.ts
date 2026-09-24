import { Answers, cleanOther } from './questions'

export type Result = {
  s1: string[]
  s2: string[]
  paths: [string, string, string]
  s4: string
  s5: string[]
  s6: string
  showLicenseNote: boolean
}

const EXISTING = 'すでにある\nデジタルコンテンツを\n活用して始める'

const Q1_SHORT: Record<string, string> = {
  Q1_A: '自分の収入を増やしたい',
  Q1_B: '家族との時間も、自分の仕事も',
  Q1_C: '新しい働き方を見つけたい',
  Q1_D: '好きなこと・得意を活かしたい',
  Q1_E: 'これからの人生を少し変えたい',
}
const Q2_SHORT: Record<string, string> = {
  Q2_A: '専業主婦',
  Q2_B: 'パート・アルバイト',
  Q2_C: '正社員・契約社員',
  Q2_D: '在宅ワーク・フリーランス',
  Q2_E: '家族のケアが中心の毎日',
}
const Q3_SHORT: Record<string, string> = {
  Q3_A: '書く・伝えることが好き',
  Q3_B: 'デザインやものづくりが好き',
  Q3_C: '人のサポートが得意',
  Q3_D: '調べてまとめるのが得意',
  Q3_E: '暮らしの工夫が得意',
  Q3_F: 'パソコン・SNS作業ができる',
  Q3_G: '得意なことはこれから探す',
}
const Q4_SHORT: Record<string, string> = {
  Q4_A: '週に1時間未満使える',
  Q4_B: '週に1〜3時間使える',
  Q4_C: '週に3〜5時間使える',
  Q4_D: '週に5〜10時間使える',
  Q4_E: '週に10時間以上使える',
  Q4_F: '使える時間はこれから見つける',
}
const Q4_MIN: Record<string, number> = {
  Q4_A: 5, Q4_B: 15, Q4_C: 20, Q4_D: 30, Q4_E: 45, Q4_F: 15,
}

const has = (a: Answers, id: string) => a.q3.includes(id)

export function generate(a: Answers): Result {
  const o1 = cleanOther(a.other.q1)
  const o2 = cleanOther(a.other.q2)
  const o3 = cleanOther(a.other.q3)
  const o5 = cleanOther(a.other.q5)

  // ① 今の私
  const w = a.q2 === 'Q2_F' ? o2 || '今の働き方' : Q2_SHORT[a.q2 ?? ''] ?? ''
  const h = a.q1 === 'Q1_F' ? o1 || 'これから変えたいこと' : Q1_SHORT[a.q1 ?? ''] ?? ''
  const s1 = [w, h].filter(Boolean)

  // ② 活かせるもの
  const s2: string[] = []
  const picks = a.q3.filter((id) => id !== 'Q3_H')
  const shortPicks = picks.map((id) => Q3_SHORT[id]).filter(Boolean)
  if (has(a, 'Q3_H') && o3) shortPicks.push(`「${o3}」が好き`)
  s2.push(...shortPicks.slice(0, shortPicks.length > 1 ? 2 : 1))
  if (a.q4) s2.push(Q4_SHORT[a.q4])
  if (s2.length < 3 && shortPicks.length <= 1 && a.q5 === 'Q5_B') s2.push('パソコンやAIに興味がある')

  // ③ 3つの道
  const aiLabel = has(a, 'Q3_B')
    ? 'AIを活用した\nデザイン制作'
    : has(a, 'Q3_A')
      ? 'AIを活用した\n文章制作'
      : 'AIを活用した\n制作や仕事'
  const P = {
    ai: aiLabel,
    own: 'デジタル商品を\n自分で作る',
    existing: EXISTING,
    exp: '自分の経験を活かした\nデジタル商品づくり',
    service: '得意なことを活かした\n制作サービス',
    aiwork: 'AIを活用した\n在宅の仕事',
    intro: '既存の商品を\n紹介する仕事',
    home: '得意なことを活かした\n在宅の仕事',
  }
  let paths: [string, string, string]
  switch (a.q5) {
    case 'Q5_A': paths = [P.exp, P.service, P.home]; break
    case 'Q5_B': paths = [P.ai, P.own, P.existing]; break
    case 'Q5_C': paths = [P.existing, P.intro, P.own]; break
    case 'Q5_D': paths = [P.service, P.aiwork, P.intro]; break
    default: paths = [P.home, P.own, P.existing]
  }

  // ④ 私が選んだ方向
  const S4: Record<string, string> = {
    Q5_A: '自分の経験や得意なことを活かして、\n商品を作ってみたい',
    Q5_B: 'パソコンやAIを使って、\n新しい仕事に挑戦したい',
    Q5_C: 'すでにある商品を活用して、\n販売を始めてみたい',
    Q5_D: '自分のスキルを活かして、\n今の仕事以外の依頼も受けてみたい',
    Q5_E: 'まだ決めきれないけれど、\nいろいろな可能性を知りたい',
  }
  const s4 = a.q5 === 'Q5_F' ? `「${o5 || 'これからやりたいこと'}」を\nやってみたい` : S4[a.q5 ?? ''] ?? ''

  // ⑤ 今週の具体的な一歩
  const min = Q4_MIN[a.q4 ?? 'Q4_F']
  const light = a.q4 === 'Q4_A'
  let first: string
  let second: string
  switch (a.q5) {
    case 'Q5_B':
      first = light
        ? 'AIに、今の自分にできそうなことを相談してみる'
        : has(a, 'Q3_B')
          ? 'AIと一緒に、\nSNS投稿用のデザインを1枚作ってみる'
          : has(a, 'Q3_A')
            ? 'AIと一緒に、\n投稿用の文章を1つ考えてみる'
            : has(a, 'Q3_E')
              ? 'AIに相談して、暮らしのチェックリストを1枚作ってみる'
              : 'AIに、今の自分にできそうなことを相談してみる'
      second = `まずは${min}分、テーマと文章を決める`
      break
    case 'Q5_A':
      first = '自分の経験を、箇条書きで5つ書き出してみる'
      second = `まずは${min}分、作りたいもののテーマを決める`
      break
    case 'Q5_C':
      first = '気になる商品を1つ選んで、内容や条件を読んでみる'
      second = `まずは${min}分、続けられそうか考える`
      break
    case 'Q5_D':
      first = 'できることを3つ書き出してみる'
      second = `まずは${min}分、自己紹介の文章を考える`
      break
    default:
      first = a.q3.includes('Q3_G')
        ? 'これまでの経験を、ざっくり書き出してみる'
        : '気になる働き方の事例を1つ調べてみる'
      second = `まずは${min}分、気になることをメモする`
  }
  const s5 = [first, second]

  // ⑥ 目指す未来
  const noJob = a.q2 === 'Q2_A' || a.q2 === 'Q2_E'
  const S6a: Record<string, string> = {
    Q1_A: noJob ? '今の暮らしを大切にしながら、新しい収入源を少しずつ育てていく。' : '今の仕事を大切にしながら、新しい収入源を少しずつ育てていく。',
    Q1_B: '家族との時間を大切にしながら、自分の仕事を少しずつ育てていく。',
    Q1_C: '今とは違う、新しい働き方を少しずつ見つけていく。',
    Q1_D: '好きなことや得意なことを、少しずつ仕事につなげていく。',
    Q1_E: '焦らず、これからの暮らしを少しずつ整えていく。',
    Q1_F: '自分のペースで、これからの働き方を育てていく。',
  }
  const S6b: Record<string, string> = {
    Q5_A: '自分の経験を形にして、自分らしい働き方の選択肢を増やしていく。',
    Q5_B: 'AIを活用して制作の幅を広げ、自分らしい働き方の選択肢を増やしていく。',
    Q5_C: 'すでにある商品も活用しながら、自分に合う進め方を探していく。',
    Q5_D: 'できることを活かして、自分らしい働き方の選択肢を増やしていく。',
    Q5_E: 'いろいろな可能性を知りながら、自分らしい働き方を見つけていく。',
    Q5_F: 'いろいろな可能性を知りながら、自分らしい働き方を見つけていく。',
  }
  const s6 = `${S6a[a.q1 ?? 'Q1_F']}\n${S6b[a.q5 ?? 'Q5_E']}`

  return { s1, s2, paths, s4, s5, s6, showLicenseNote: paths.includes(EXISTING) }
}
