import { Item, MAP_H, MAP_W, FONT } from './layout'

export default function MapView({ items }: { items: Item[] }) {
  return (
    <svg
      className="map"
      viewBox={`0 0 ${MAP_W} ${MAP_H}`}
      role="img"
      aria-label="私だけの未来チートマップ"
    >
      <image href={`${import.meta.env.BASE_URL}images/future-map-background.png`} x="0" y="0" width={MAP_W} height={MAP_H} />
      {items.map((it, i) =>
        it.kind === 'rect' ? (
          <rect key={i} x={it.x} y={it.y} width={it.size} height={it.size} fill="none" stroke={it.color} strokeWidth={2} />
        ) : (
          <text
            key={i}
            x={it.x}
            y={it.y}
            fontSize={it.size}
            fontWeight={it.weight}
            fill={it.color}
            textAnchor={it.anchor}
            dominantBaseline="central"
            style={{ fontFamily: FONT }}
          >
            {it.text}
          </text>
        ),
      )}
    </svg>
  )
}
