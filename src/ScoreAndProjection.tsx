import * as React from 'react'

interface ScoreAndProjectionProps {
  score: number
  projection?: number
}

export function ScoreAndProjection({score, projection}: ScoreAndProjectionProps) {
  if (projection !== undefined && score.toFixed(1) !== projection.toFixed(1)) {
    return (
      <>
        <span className="actual">{score.toFixed(1)}</span>
        <br />
        <span className="projection">{projection.toFixed(1)}</span>
      </>
    )
  } else {
    return (
      <span className="actual done">{score.toFixed(1)}</span>
    )
  }
}
