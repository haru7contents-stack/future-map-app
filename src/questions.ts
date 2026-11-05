export type Option = { id: string; label: string; short?: string; other?: boolean; exclusive?: boolean }
export type QKey = 'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'q6'
export type Question = {
  key: QKey
  title: string
  multi?: number // 複数選択の上限
  hint?: string
  options: Option[]
}

export const QUESTIONS: Question[] = [
  {
    key: 'q1',
    title: '今のあなたの毎日に、いちばん近いのは？',
    options: [
      { id: 'D_KIDS', label: '子育て中', short: '子育て中' },
      { id: 'D_CARE', label: '子育てや仕事に加えて、親のケアもしている', short: '親のケアもしている' },
      { id: 'D_PART', label: 'パート・アルバイトをしている', short: 'パート・アルバイト中' },
      { id: 'D_WORK', label: '会社員・契約社員として働いている', short: '会社で働いている' },
      { id: 'D_HOME', label: '専業主婦で、今は仕事をしていない', short: '専業主婦' },
      { id: 'D_OTHER', label: 'その他', other: true },
    ],
  },
  {
    key: 'q2',
    title: 'これまでの経験で、当てはまるものは？',
    multi: 3,
    hint: '3つまで選べます。いちばん自信のあるものから選んでください',
    options: [
      { id: 'kids', label: '子育て' },
      { id: 'care', label: '親のケア・介護' },
      { id: 'nurse', label: '看護・医療・福祉の仕事' },
      { id: 'edu', label: '保育・教育の仕事' },
      { id: 'office', label: '事務・経理の仕事' },
      { id: 'shop', label: '接客・販売の仕事' },
      { id: 'beauty', label: '美容・ファッション' },
      { id: 'cook', label: '料理・家事の工夫' },
      { id: 'design', label: 'デザイン・ものづくり' },
      { id: 'hobby', label: '続けている趣味・習いごと' },
      { id: 'change', label: '転職・ブランク・移住など、働き方や暮らしを変えた経験' },
      { id: 'none', label: 'この中にはない', exclusive: true },
    ],
  },
  {
    key: 'q3',
    title: 'まわりから、よく頼まれたり聞かれたりすることは？',
    options: [
      { id: 'S_PLAN', label: '段取りや整理', short: '段取りや整理' },
      { id: 'S_RESEARCH', label: '調べて、分かりやすくまとめること', short: '調べてまとめること' },
      { id: 'S_LISTEN', label: '話を聞く・相談に乗ること', short: '話を聞くこと' },
      { id: 'S_MAKE', label: '見た目を整える・作ること', short: '見た目を整えること' },
      { id: 'S_TEACH', label: 'やり方を教えること', short: 'やり方を教えること' },
      { id: 'S_NONE', label: '特に思いつかない（大丈夫です）' },
    ],
  },
  {
    key: 'q4',
    title: 'どんな人の役に立ちたいですか？',
    options: [
      { id: 'T_PAST', label: '少し前の自分と、同じ立場の人', short: '少し前の自分と同じ立場の人' },
      { id: 'T_AGE', label: '同じ年代の女性', short: '同じ年代の女性' },
      { id: 'T_MAMA', label: '子育て中のママ・パパ', short: '子育て中のママ・パパ' },
      { id: 'T_PARENT', label: '親のことが気になり始めた人', short: '親のことが気になり始めた人' },
      { id: 'T_PRO', label: '同じ仕事をしている人・その後輩', short: '同じ仕事をしている人' },
      { id: 'T_START', label: '新しいことを始めたい人', short: '新しいことを始めたい人' },
    ],
  },
  {
    key: 'q5',
    title: 'その人が、いちばん困っていそうなことは？',
    options: [
      { id: 'P_WHERE', label: '何から始めればいいか分からない', short: '何から始めればいいか分からない' },
      { id: 'P_TIME', label: '時間がない', short: '時間がない' },
      { id: 'P_INFO', label: '情報が多すぎて迷っている', short: '情報が多すぎて迷っている' },
      { id: 'P_ALONE', label: 'ひとりで抱えていて不安', short: 'ひとりで抱えていて不安' },
      { id: 'P_FAIL', label: '失敗したくない', short: '失敗したくない' },
    ],
  },
  {
    key: 'q6',
    title: '商品づくりに、1週間でどのくらい時間を使えそうですか？',
    options: [
      { id: 'H_1', label: '週に1時間未満' },
      { id: 'H_3', label: '週に1〜3時間' },
      { id: 'H_5', label: '週に3〜5時間' },
      { id: 'H_10', label: '週に5時間以上' },
      { id: 'H_Q', label: '日によって違うので、まだ分からない' },
    ],
  },
]

export type Answers = {
  q1?: string
  q2: string[] // 選んだ順
  q3?: string
  q4?: string
  q5?: string
  q6?: string
  otherQ1: string
}

export const emptyAnswers = (): Answers => ({ q2: [], otherQ1: '' })

export const OTHER_MAX = 20
export const cleanOther = (s: string) =>
  s.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, OTHER_MAX)

export const label = (key: QKey, id?: string) =>
  QUESTIONS.find((q) => q.key === key)?.options.find((o) => o.id === id)

// 動作確認用（?sample=1〜4）
export const TEST_PATTERNS: Answers[] = [
  { q1: 'D_KIDS', q2: ['nurse', 'kids'], q3: 'S_LISTEN', q4: 'T_PRO', q5: 'P_TIME', q6: 'H_3', otherQ1: '' },
  { q1: 'D_CARE', q2: ['care'], q3: 'S_PLAN', q4: 'T_PARENT', q5: 'P_WHERE', q6: 'H_1', otherQ1: '' },
  { q1: 'D_HOME', q2: ['none'], q3: 'S_NONE', q4: 'T_START', q5: 'P_ALONE', q6: 'H_Q', otherQ1: '' },
  { q1: 'D_OTHER', q2: ['design', 'hobby', 'change'], q3: 'S_MAKE', q4: 'T_AGE', q5: 'P_INFO', q6: 'H_10', otherQ1: 'フリーランスのイラストレーター' },
]
