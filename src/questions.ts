export type Option = { id: string; label: string; other?: boolean; exclusive?: boolean }
export type Question = {
  key: 'q1' | 'q2' | 'q3' | 'q4' | 'q5'
  title: string
  multi?: boolean
  hint?: string
  options: Option[]
}

export const QUESTIONS: Question[] = [
  {
    key: 'q1',
    title: '今、あなたが一番変えたいことは何ですか？',
    options: [
      { id: 'Q1_A', label: '自分の収入を増やしたい' },
      { id: 'Q1_B', label: '家族との時間を大切にしながら、自分の仕事も持ちたい' },
      { id: 'Q1_C', label: '今の仕事とは違う、新しい働き方を見つけたい' },
      { id: 'Q1_D', label: '自分の好きなことや得意なことを活かしたい' },
      { id: 'Q1_E', label: '今はわからないけれど、これからの人生を少し変えたい' },
      { id: 'Q1_F', label: 'その他', other: true },
    ],
  },
  {
    key: 'q2',
    title: '今、あなたはどのような働き方をしていますか？',
    options: [
      { id: 'Q2_A', label: '専業主婦で、今は仕事をしていない' },
      { id: 'Q2_B', label: 'パート・アルバイトをしている' },
      { id: 'Q2_C', label: '正社員・契約社員として働いている' },
      { id: 'Q2_D', label: '在宅ワーク・フリーランスをしている' },
      { id: 'Q2_E', label: '家族のケアなどで、今は働くことが難しい' },
      { id: 'Q2_F', label: 'その他', other: true },
    ],
  },
  {
    key: 'q3',
    title: 'あなたが得意なことや、好きなことは何ですか？',
    multi: true,
    hint: '当てはまるものをいくつでも選べます',
    options: [
      { id: 'Q3_A', label: '文章を書いたり、人に何かを伝えること' },
      { id: 'Q3_B', label: 'デザインやものづくり' },
      { id: 'Q3_C', label: '人の相談に乗ったり、誰かをサポートすること' },
      { id: 'Q3_D', label: '情報を調べたり、わかりやすくまとめること' },
      { id: 'Q3_E', label: '家事・育児・暮らしの工夫' },
      { id: 'Q3_F', label: 'パソコンやSNSを使った作業' },
      { id: 'Q3_G', label: 'まだ自分の得意なことがわからない', exclusive: true },
      { id: 'Q3_H', label: 'その他', other: true },
    ],
  },
  {
    key: 'q4',
    title: '新しい収入づくりのために、1週間でどのくらいの時間を使えそうですか？',
    options: [
      { id: 'Q4_A', label: '週に1時間未満' },
      { id: 'Q4_B', label: '週に1〜3時間' },
      { id: 'Q4_C', label: '週に3〜5時間' },
      { id: 'Q4_D', label: '週に5〜10時間' },
      { id: 'Q4_E', label: '週に10時間以上' },
      { id: 'Q4_F', label: '日によって違うので、まだわからない' },
    ],
  },
  {
    key: 'q5',
    title: 'これからの収入づくりで、あなたが一番やってみたいことは何ですか？',
    options: [
      { id: 'Q5_A', label: '自分の経験や得意なことを活かして、商品を作ってみたい' },
      { id: 'Q5_B', label: 'パソコンやAIを使って、新しい仕事に挑戦したい' },
      { id: 'Q5_C', label: 'すでにある商品を活用して、販売を始めてみたい' },
      { id: 'Q5_D', label: '自分のスキルを活かして、今の仕事以外の依頼も受けてみたい' },
      { id: 'Q5_E', label: 'まだわからないので、いろいろな可能性を知りたい' },
      { id: 'Q5_F', label: 'その他', other: true },
    ],
  },
]

export type Answers = {
  q1?: string
  q2?: string
  q3: string[]
  q4?: string
  q5?: string
  other: { q1: string; q2: string; q3: string; q5: string }
}

export const emptyAnswers = (): Answers => ({
  q3: [],
  other: { q1: '', q2: '', q3: '', q5: '' },
})

export const SAMPLE_ANSWERS: Answers = {
  q1: 'Q1_A',
  q2: 'Q2_D',
  q3: ['Q3_B'],
  q4: 'Q4_D',
  q5: 'Q5_B',
  other: { q1: '', q2: '', q3: '', q5: '' },
}

export const OTHER_MAX = 20
export const cleanOther = (s: string) =>
  s.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, OTHER_MAX)

const o = (q1 = '', q2 = '', q3 = '', q5 = '') => ({ q1, q2, q3, q5 })
// 動作確認用の回答パターン（?sample=1〜6 で表示）
export const TEST_PATTERNS: Answers[] = [
  SAMPLE_ANSWERS,
  { q1: 'Q1_B', q2: 'Q2_E', q3: ['Q3_A', 'Q3_D', 'Q3_E'], q4: 'Q4_A', q5: 'Q5_C', other: o() },
  { q1: 'Q1_E', q2: 'Q2_A', q3: ['Q3_G'], q4: 'Q4_F', q5: 'Q5_E', other: o() },
  { q1: 'Q1_D', q2: 'Q2_C', q3: ['Q3_C', 'Q3_F'], q4: 'Q4_E', q5: 'Q5_D', other: o() },
  { q1: 'Q1_F', q2: 'Q2_F', q3: ['Q3_B', 'Q3_H'], q4: 'Q4_C', q5: 'Q5_F', other: o('とても長い自由入力のテストですよ', 'これも長い長い働き方の入力です', 'ものすごく長い好きなことの入力', '長い長いやりたいことの入力テスト') },
  { q1: 'Q1_C', q2: 'Q2_B', q3: ['Q3_A'], q4: 'Q4_B', q5: 'Q5_A', other: o() },
]
