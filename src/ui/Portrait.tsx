import { PORTRAIT_IMAGES } from './portraits/art'
import { PortraitArt } from './portraits/draw'
import { PORTRAITS } from './portraits/specs'
import { BOX } from './portraits/spec'

interface Props {
  /** Hero or enemy id. */
  id: string
  /** Accessible name. */
  name: string
  className?: string
}

/** A framed character portrait: imported art if present, otherwise drawn. */
export function Portrait({ id, name, className = '' }: Props) {
  const img = PORTRAIT_IMAGES[id]
  const spec = PORTRAITS[id]
  if (!img && !spec) return null
  return (
    <div className={`portrait ${className}`}>
      {img ? (
        <img src={img} alt={name} />
      ) : (
        <svg viewBox={`0 0 ${BOX.w} ${BOX.h}`} role="img" aria-label={name}>
          <PortraitArt spec={spec} />
        </svg>
      )}
    </div>
  )
}

/**
 * A character standing in a scene (inside the scene's 400x200 SVG). `x` is the
 * center of their feet, `y` the ground line, `height` their drawn height.
 * `flip` turns them to face left (bosses face the hero).
 */
export function SceneActor({ id, x, y, height, flip = false }: { id: string; x: number; y: number; height: number; flip?: boolean }) {
  const img = PORTRAIT_IMAGES[id]
  const spec = PORTRAITS[id]
  if (!img && !spec) return null
  const s = height / BOX.h
  const w = BOX.w * s
  const mirror = flip ? `translate(${x * 2} 0) scale(-1 1)` : ''
  return (
    <g className="scene-actor" transform={mirror}>
      {img ? (
        <image href={img} x={x - w / 2} y={y - height} width={w} height={height} preserveAspectRatio="xMidYMax meet" />
      ) : (
        <g transform={`translate(${x - w / 2} ${y - height}) scale(${s})`}>
          <PortraitArt spec={spec} />
        </g>
      )}
    </g>
  )
}
