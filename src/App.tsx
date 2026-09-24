import { useEffect, useMemo, useState } from 'react'
import { Answers, OTHER_MAX, QUESTIONS, TEST_PATTERNS, emptyAnswers } from './questions'
import { generate } from './generate'
import { Item, buildItems, measure } from './layout'
import { canvasToBlob, loadFonts, makePdfBlob, renderCanvas, saveBlob } from './exportMap'
import MapView from './MapView'

const IG_URL = 'https://www.instagram.com/haru7_contents/'

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
      {typeof screen === 'number' && (
        <Ask idx={screen} ans={ans} setAns={setAns} go={setScreen} />
      )}
      {screen === 'result' && <Result ans={ans} onRestart={restart} />}
    </div>
  )
}

function Start({ onStart }: { onStart: () => void }) {
  return (
    <main className="card start">
      <h1>これからの私、どうする？ AI</h1>
      <p className="by">by haru7_contents</p>
      <p className="lead">
        5つの質問に答えるだけで、あなたの未来チートマップが完成します。
        <br />
        <br />
        家事・育児・親のこと、仕事。
        <br />
        今の暮らしに合わせた新しい働き方や収入づくりの選択肢を、一緒に見つけましょう。
      </p>
      <ul className="notes">
        <li>所要時間の目安：3〜5分</li>
        <li>質問は一つずつ</li>
        <li>完成したマップは画像・PDFで保存できます</li>
      </ul>
      <button className="primary" onClick={onStart}>無料で始める</button>
      <p className="small">入力した内容はこの端末の中だけで使われ、外部には送信されません。</p>
    </main>
  )
}

function Ask({ idx, ans, setAns, go }: { idx: number; ans: Answers; setAns: (a: Answers) => void; go: (s: Screen) => void }) {
  const q = QUESTIONS[idx]
  const otherKey = q.key as 'q1' | 'q2' | 'q3' | 'q5'
  const selected: string[] = q.key === 'q3' ? ans.q3 : ans[q.key] ? [ans[q.key] as string] : []
  const otherId = q.options.find((o) => o.other)?.id
  const otherSelected = otherId ? selected.includes(otherId) : false
  const otherText = q.key === 'q4' ? '' : ans.other[otherKey]
  const answered = selected.length > 0 && (!otherSelected || otherText.trim().length > 0)

  const pick = (id: string) => {
    if (q.multi) {
      const opt = q.options.find((o) => o.id === id)!
      let next: string[]
      if (selected.includes(id)) next = selected.filter((s) => s !== id)
      else if (opt.exclusive) next = [id]
      else next = [...selected.filter((s) => !q.options.find((o) => o.id === s)?.exclusive), id]
      setAns({ ...ans, q3: next })
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
      <h2>{q.title}</h2>
      {q.hint && <p className="hint">{q.hint}</p>}
      <div className="options" role={q.multi ? 'group' : 'radiogroup'}>
        {q.options.map((o) => {
          const on = selected.includes(o.id)
          return (
            <div key={o.id}>
              <button
                type="button"
                className={`opt${on ? ' on' : ''}`}
                aria-pressed={on}
                onClick={() => pick(o.id)}
              >
                <span className="mark">{on ? '✓' : ''}</span>
                {o.label}
              </button>
              {o.other && on && (
                <input
                  className="other"
                  type="text"
                  maxLength={OTHER_MAX}
                  value={otherText}
                  placeholder={`自由に入力（${OTHER_MAX}文字まで）`}
                  onChange={(e) => setAns({ ...ans, other: { ...ans.other, [otherKey]: e.target.value } })}
                />
              )}
            </div>
          )
        })}
      </div>
      <div className="nav">
        <button className="ghost" onClick={back}>戻る</button>
        <button className="primary" disabled={!answered} onClick={next}>
          {last ? '未来チートマップを作る' : '次へ'}
        </button>
      </div>
    </main>
  )
}

function Result({ ans, onRestart }: { ans: Answers; onRestart: () => void }) {
  const result = useMemo(() => generate(ans), [ans])
  const [items, setItems] = useState<Item[] | null>(null)
  const [busy, setBusy] = useState<string>('')
  const [preview, setPreview] = useState<string>('')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    let alive = true
    ;(async () => {
      await loadFonts(buildItems(result, measure))
      if (alive) setItems(buildItems(result, measure))
    })()
    return () => { alive = false }
  }, [result])

  const savePng = async () => {
    if (!items) return
    setBusy('png'); setMsg('')
    try {
      const c = await renderCanvas(items, 2)
      const blob = await canvasToBlob(c)
      const r = await saveBlob(blob, 'mirai-cheat-map.png')
      setMsg(r === 'shared' ? '' : '画像を保存しました（ダウンロードフォルダをご確認ください）')
    } catch { setMsg('保存に失敗しました。下の「保存できないときは」をお試しください。') }
    setBusy('')
  }
  const savePdf = async () => {
    if (!items) return
    setBusy('pdf'); setMsg('')
    try {
      const c = await renderCanvas(items, 2)
      const blob = await makePdfBlob(c)
      const r = await saveBlob(blob, 'mirai-cheat-map.pdf')
      setMsg(r === 'shared' ? '' : 'PDFを保存しました（ダウンロードフォルダをご確認ください）')
    } catch { setMsg('保存に失敗しました。下の「保存できないときは」をお試しください。') }
    setBusy('')
  }
  const showImage = async () => {
    if (!items) return
    const c = await renderCanvas(items, 2)
    setPreview(c.toDataURL('image/png'))
  }

  return (
    <main className="result">
      <h2 className="done">未来チートマップが完成しました</h2>
      <div className="mapwrap">
        {items ? <MapView items={items} /> : <p className="loading">マップを作っています…</p>}
      </div>
      <div className="actions">
        <button className="primary" disabled={!items || !!busy} onClick={savePng}>{busy === 'png' ? '作成中…' : '画像で保存'}</button>
        <button className="primary" disabled={!items || !!busy} onClick={savePdf}>{busy === 'pdf' ? '作成中…' : 'PDFで保存'}</button>
        <button className="ghost" onClick={onRestart}>もう一度やる</button>
      </div>
      {msg && <p className="msg">{msg}</p>}
      <button className="link" onClick={showImage} disabled={!items}>保存できないときは（画像を表示して長押しで保存）</button>
      <a className="ig" href={IG_URL} target="_blank" rel="noopener noreferrer">ハルコンテンツをフォローする</a>
      <p className="disclaimer">
        このマップは適職や収入を診断・予測するものではなく、これからを考えるためのヒントです。
        {result.showLicenseNote && (
          <>
            <br />
            ※すでにあるデジタルコンテンツを使う場合は、販売や編集できる範囲が商品ごとの契約で異なります。必ず条件をご確認ください。
          </>
        )}
      </p>
      {preview && (
        <div className="modal" onClick={() => setPreview('')}>
          <p>画像を長押しして「写真に追加」などで保存できます。タップで閉じます。</p>
          <img src={preview} alt="未来チートマップ" />
        </div>
      )}
    </main>
  )
}
