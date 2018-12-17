import * as React from 'react'
import { playerNumbers } from './theScoreNumber'

interface HeadshotProps {
  name: string
  alt: string
}

function getHeadshot(athleteName: string): string | null {
  let number = playerNumbers[athleteName]
  if (number) {
    return `https://d1si3tbndbzwz9.cloudfront.net/basketball/player/${number}/transparent_medium_headshot.png`
  } else {
    return null
  }
}

export function Headshot({ name, alt }: HeadshotProps) {
  let headshot = getHeadshot(name)
  if (headshot !== null) {
    return <img width={150} height={150} src={headshot} className="headshot" alt={alt} />
  } else {
    return <span>{alt}</span>
  }
}
