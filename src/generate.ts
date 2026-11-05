import { Answers, cleanOther, label } from './questions'
import { SEEDS, Seed } from './seeds'

export type Result = {
  me: string // 01 私はこんな人
  meShort: string // 画像用（経験は2つまで）
  target: string // 02 届けたい人
  trouble: string // いちばんの困りごと
  strength: string // 05 私だから入れられる経験
  seeds: Seed[]
  mainLabel: string
  extra: { label: string; seed: Seed }[]
  pace: string
}

const PACE: Record<string, string> = {
  H_1: '週1時間未満なら、まずは10ページくらいの小さな形から。1日10分ずつでも進められます。',
  H_3: '週1〜3時間なら、まずは1つのテーマにしぼった小さな商品から始めるのがおすすめです。',
  H_5: '週3〜5時間あれば、手順書やテンプレートのように、少し中身の多い形も目指せます。',
  H_10: '週5時間以上あれば、記録とテンプレートを組み合わせた、しっかりした形も目指せます。',
  H_Q: '時間が読めない毎日でも大丈夫。まずは小さな形から、少しずつ育てていけます。',
}

export function generate(a: Answers): Result {
  const exp = a.q2.filter((id) => id !== 'none')
  const expLabels = exp.map((id) => label('q2', id)?.label ?? '')

  const day = a.q1 === 'D_OTHER' ? cleanOther(a.otherQ1) || '自分らしい毎日' : label('q1', a.q1)?.short ?? ''
  const me = expLabels.length
    ? `${day}。これまでに「${expLabels.join('」「')}」の経験がある人`
    : `${day}。毎日の中で、たくさんのことを乗り越えてきた人`

  const shortLabels = expLabels.length > 2 ? [...expLabels.slice(0, 2)] : expLabels
  const meShort = shortLabels.length
    ? `${day}。「${shortLabels.join('」「')}」${expLabels.length > 2 ? 'などの' : 'の'}経験がある人`
    : me

  const target = label('q4', a.q4)?.short ?? ''
  const trouble = label('q5', a.q5)?.short ?? ''

  const skill = a.q3 && a.q3 !== 'S_NONE' ? label('q3', a.q3)?.short : ''
  const base = expLabels.length ? `「${expLabels[0]}」の経験` : 'これまでの暮らしの経験'
  const strength = skill
    ? `${base}と、まわりから頼まれる「${skill}」の力`
    : `${base}そのもの。あなたにとって当たり前のことが、誰かの知りたいことです`

  // いちばん自信のある経験からは3つ（立場のちがう例を入れて、どれかに当てはまるように）
  const seeds: Seed[] = exp.length ? SEEDS[exp[0]] : SEEDS.none
  const mainLabel = expLabels[0] ?? ''
  // 2つ目・3つ目に選んだ経験からは1つずつ
  const extra = exp.slice(1).map((id, i) => ({ label: expLabels[i + 1], seed: SEEDS[id][0] }))

  return { me, meShort, target, trouble, strength, seeds, mainLabel, extra, pace: PACE[a.q6 ?? ''] ?? PACE.H_Q }
}
