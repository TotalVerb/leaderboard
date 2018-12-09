import { playerNumbers } from './theScoreNumber'

export interface Athlete {
  name: string
  position: number
  fpts: number
  team: string
  points: number
  assists: number
  rebounds: number
  steals: number
  blocks: number
  turnovers: number
  color: string
  projection: number
  three_point_made: number
}

export function getHeadshot(athlete: Athlete): string | null {
  let number = playerNumbers[athlete.name]
  if (number) {
    return `https://d1si3tbndbzwz9.cloudfront.net/basketball/player/${number}/transparent_medium_headshot.png`
  } else {
    return null
  }
}

export function project(athlete: Athlete): number {
  let doubles = [
    athlete.points, athlete.assists, athlete.rebounds, athlete.steals, athlete.blocks
  ].filter(x => x >= 10).length
  let rawProjection = (
    athlete.projection
    - 0.05 * athlete.rebounds
    - 1.5 * (doubles >= 2 ? 1 : 0)
    - 3 * (doubles >= 3 ? 1 : 0)
    - athlete.turnovers * 0.5
  )
  let adjustedProjection = athlete.fpts + (rawProjection - athlete.fpts) * 0.9
  return adjustedProjection
}
