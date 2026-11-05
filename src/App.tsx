import { useEffect, useMemo, useState } from 'react'
import { Answers, OTHER_MAX, QUESTIONS, TEST_PATTERNS, emptyAnswers } from './questions'
import { generate } from './generate'
import { canvasToBlob, renderCard, saveBlob } from './card'

const NOTE_URL = 'https://note.com/haru7contents/n/n8b9f0244629b'
const THREADS_URL = 'https://www.threads.com/@haru7_contents'
const IMG = (name: string) => `${import.meta.env.BASE_URL}images/haru/${name}.png`
const ASK_IMG = ['maigo', 'maigo', 'kizuki', 'kizuki', 'dekisou', 'dekisou']

type Screen = 'start' | number | 'result'

export default function App() {
  const sampleParam = new URLSearchParams(window.location.search).get('sample')
  const sample = sampleParam !== null
  const [screen, setScreen] = useState<Screen>(sample ? 'result' : 'start')
  const [ans, setAns] = useState<Answers>(
    sample ? TEST_PATTERNS[(Number(sampleParam) || 1) - 1] ?? TEST_PATTERNS[0] : emptyAnswers(),
  )

  const restart = () => {
    setAns(emptyAnswers())
    setScreen('start')
    window.scrollTo(0, 0)
  }

  return (
    <div className="app">
      {screen === 'start' && <Start onStart={() => setScreen(0)} />}
      {typeof screen === 'number' && <Ask idx={screen} ans={ans} setAns={setAns} go={setScreen} />}
      {screen === 'result' && <Result ans={ans} onRestart={restart} />}
    </div>
  )
}

function Start({ onStart }: { onStart: () => void }) {
  return (
    <main className="card start">
      <img className="haru hero" src={IMG('ikeru')} alt="" />
      <p className="eyebrow">「私に売れるものなんてない」と思っている人へ</p>
      <h1>私の商品のタネ診断</h1>
      <p className="by">by ハル（haru7_contents）</p>
      <p className="lead">
        6つの質問に答えると、あなたの経験から生まれる「商品のタネ」と、
        それを探している人の姿が見えてきます。
        <br />
        <br />
        すごい実績や資格がなくても大丈夫。
        あなたにとって当たり前の経験が、誰かにとっては「知りたかったこと」かもしれません。
      </p>
      <ul className="notes">
        <li>選ぶだけ・約2分</li>
        <li>結果は「私の商品カルテ（ミニ版）」として画像で保存できます</li>
        <li>ログイン不要・無料</li>
      </ul>
      <button className="primary" onClick={onStart}>無料で診断する</button>
      <p className="small">入力した内容はこの端末の中だけで使われ、外部には送信されません。</p>
    </main>
  )
}

function Ask({ idx, ans, setAns, go }: { idx: number; ans: Answers; setAns: (a: Answers) => void; go: (s: Screen) => void }) {
  const q = QUESTIONS[idx]
  const selected: string[] = q.key === 'q2' ? ans.q2 : ans[q.key] ? [ans[q.key] as string] : []
  const otherOn = q.key === 'q1' && ans.q1 === 'D_OTHER'
  const answered = selected.length > 0 && (!otherOn || ans.otherQ1.trim().length > 0)
  const full = q.multi ? selected.length >= q.multi : false

  const pick = (id: string) => {
    if (q.multi) {
      const opt = q.options.find((o) => o.id === id)!
      let next: string[]
      if (selected.includes(id)) next = selected.filter((s) => s !== id)
      else if (opt.exclusive) next = [id]
      else {
        const base = selected.filter((s) => !q.options.find((o) => o.id === s)?.exclusive)
        if (base.length >= q.multi) return
        next = [...base, id]
      }
      setAns({ ...ans, q2: next })
    } else {
      setAns({ ...ans, [q.key]: id })
    }
  }
  const last = idx === QUESTIONS.length - 1
  const next = () => {
    window.scrollTo(0, 0)
    go(last ? 'result' : idx + 1)
  }
  const back = () => {
    window.scrollTo(0, 0)
    go(idx === 0 ? 'start' : idx - 1)
  }

  return (
    <main className="card">
      <div className="progress-label">質問 {idx + 1} / {QUESTIONS.length}</div>
      <div className="bar"><div style={{ width: `${((idx + 1) / QUESTIONS.length) * 100}%` }} /></div>
      <div className="qhead">
        <h2>{q.title}</h2>
        <img className="haru qimg" src={IMG(ASK_IMG[idx] ?? 'maigo')} alt="" />
      </div>
      {q.hint && <p className="hint">{q.hint}</p>}
      <div className="options" role={q.multi ? 'group' : 'radiogroup'}>
        {q.options.map((o) => {
          const on = selected.includes(o.id)
          const order = q.multi && on ? selected.indexOf(o.id) + 1 : 0
          const dim = full && !on && !o.exclusive
          return (
            <div key={o.id}>
              <button
                type="button"
                className={`opt${on ? ' on' : ''}${dim ? ' dim' : ''}`}
                aria-pressed={on}
                onClick={() => pick(o.id)}
              >
                <span className="mark">{on ? (order && !o.exclusive ? order : '✓') : ''}</span>
                {o.label}
              </button>
              {o.other && on && (
                <input
                  className="other"
                  type="text"
                  maxLength={OTHER_MAX}
                  value={ans.otherQ1}
                  placeholder={`自由に入力（${OTHER_MAX}文字まで）`}
                  onChange={(e) => setAns({ ...ans, otherQ1: e.target.value })}
                />
              )}
            </div>
          )
        })}
      </div>
      <div className="nav">
        <button className="ghost" onClick={back}>戻る</button>
        <button className="primary" disabled={!answered} onClick={next}>
          {last ? '診断結果を見る' : '次へ'}
        </button>
      </div>
    </main>
  )
}

function Result({ ans, onRestart }: { ans: Answers; onRestart: () => void }) {
  const r = useMemo(() => generate(ans), [ans])
  const [img, setImg] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [preview, setPreview] = useState(false)

  useEffect(() => {
    let alive = true
    renderCard(r, 1).then((c) => alive && setImg(c.toDataURL('image/png')))
    return () => { alive = false }
  }, [r])

  const save = async () => {
    setBusy(true); setMsg('')
    try {
      const c = await renderCard(r, 2)
      const res = await saveBlob(await canvasToBlob(c), 'shohin-karte.png')
      setMsg(res === 'shared' ? '' : '画像を保存しました（ダウンロードフォルダをご確認ください）')
    } catch {
      setMsg('保存に失敗しました。下の「保存できないときは」をお試しください。')
    }
    setBusy(false)
  }

  return (
    <main className="result">
      <img className="haru hero" src={IMG('dekita')} alt="" />
      <h2 className="done">あなたの商品カルテ（ミニ版）ができました</h2>

      <section className="karte">
        <div className="row"><span className="no">01</span><div><b>私はこんな人</b><p>{r.me}</p></div></div>
        <div className="row"><span className="no">02</span><div><b>届けたい人</b><p>{r.target}<br />いちばんの困りごと：{r.trouble}</p></div></div>
        <div className="row"><span className="no">05</span><div><b>私だから入れられる経験</b><p>{r.strength}</p></div></div>
      </section>

      <h2 className="sec">🌱 あなたの商品のタネ</h2>
      <p className="hint">たとえば、こんな商品が作れます。あなたの経験に近いものを、思い浮かべながら読んでみてください。</p>
      {r.seeds.map((s, i) => (
        <article className="seed" key={i}>
          <span className="seedno">タネの例{'①②③'[i]}</span>
          <h3>{s.title}</h3>
          <dl>
            <dt>どんな商品？</dt><dd>{s.what}</dd>
            <dt>こんな人が探しています</dt><dd>{s.who}</dd>
            <dt>お金を払ってでも欲しい理由</dt><dd>{s.why}</dd>
            <dt>中身の例</dt><dd>{s.inside}</dd>
            <dt>あなただから入れられること</dt><dd>{s.you}</dd>
          </dl>
          {s.note && <p className="seednote">※{s.note}</p>}
        </article>
      ))}

      <section className="why">
        <h3>お金を払ってでも「欲しい」と思われる、3つの理由</h3>
        <ol>
          <li><b>困りごとが大きいから</b>：仕事・お金・時間・気持ちのつらさがかかっている</li>
          <li><b>自分で調べると、何か月もかかるから</b>：その近道になる</li>
          <li><b>経験した人にしか書けないから</b>：実例や本音が入っている</li>
        </ol>
        <p>上のタネの例は、この3つがそろうように選んでいます。</p>
      </section>

      <p className="pace">⏰ {r.pace}</p>

      <section className="next">
        <img className="haru step-img" src={IMG('tsugi')} alt="" />
        <h3>このタネを、本命の商品にするまで</h3>
        <div className="step"><span>1</span><p>まずは教材で、再販権つきの商品を使って「作って売る」流れをひと通り経験する</p></div>
        <div className="step"><span>2</span><p>その経験と、あなたのタネを組み合わせて、本命の商品へ</p></div>
        <p className="nexttext">
          いきなり本命から作ると、売り方が分からずに止まってしまいがち。
          先に「作って売る」を1回経験しておくと、2つ目からは迷いが減ります。
        </p>
        <a className="cta" href={NOTE_URL} target="_blank" rel="noopener noreferrer">
          noteで教材を見てみる
          <small>無料部分で9割読めます</small>
        </a>
      </section>

      <h2 className="sec">結果を画像で保存する</h2>
      <div className="imgwrap">{img ? <img src={img} alt="私の商品カルテ（ミニ版）" /> : <p className="loading">画像を作っています…</p>}</div>
      <div className="actions">
        <button className="primary" disabled={!img || busy} onClick={save}>{busy ? '作成中…' : '画像で保存'}</button>
        <button className="ghost" onClick={onRestart}>もう一度やる</button>
      </div>
      {msg && <p className="msg">{msg}</p>}
      <button className="link" onClick={() => setPreview(true)} disabled={!img}>保存できないときは（画像を表示して長押しで保存）</button>

      <img className="haru hero small" src={IMG('yobikake')} alt="" />
      <a className="sub" href={THREADS_URL} target="_blank" rel="noopener noreferrer">Threadsでハルの「迷子の日々」を見る</a>
      <p className="disclaimer">
        この診断は、商品づくりを考えるためのヒントです。適職や収入を診断・予測するものではなく、売れることを約束するものでもありません。
        医療・税金・子どもの心などに関わるテーマは、専門家の判断にかわるものではない「わが家の記録」として扱ってください。
      </p>
      {preview && (
        <div className="modal" onClick={() => setPreview(false)}>
          <p>画像を長押しして「写真に追加」などで保存できます。タップで閉じます。</p>
          <img src={img} alt="私の商品カルテ（ミニ版）" />
        </div>
      )}
    </main>
  )
}
