import * as React from 'react'
import './App.css'

import { HTMLTable } from "@blueprintjs/core"
import { GlobalLeague, League, LeagueSelect } from "./LeagueSelect"
import { Athlete, getHeadshot, project } from './athlete'
import { ScoreAndProjection } from './ScoreAndProjection'

interface LineupMap {
  [name: string]: Array<Athlete>
}

interface Contestant {
  lineup: Array<Athlete>
  name: string
  total: number
}

function Contestant(lineups: LineupMap, contestant: string): Contestant {
  return {
    lineup: lineups[contestant],
    name: contestant,
    total: lineups[contestant].map(data => data.fpts).reduce((f, g) => f + g, 0.0),
  }
}

interface AthleteProps {
  athlete: Athlete
}

interface AthleteNameProps {
  name: string
}

function AthleteName({name}: AthleteNameProps) {
  let parts = name.split(' ')
  let firstName = parts.slice(0, parts.length - 1).join(' ')
  let lastName = parts[parts.length - 1]
  return (
    <span>
      {firstName}
      <br />
      <mark>{lastName}</mark>
    </span>
  )
}

function AthleteCell({athlete}: AthleteProps) {
  let headshot = getHeadshot(athlete)
  let [red, green, blue] = [
    parseInt(athlete.color.slice(1, 3), 16),
    parseInt(athlete.color.slice(3, 5), 16),
    parseInt(athlete.color.slice(5, 7), 16),
  ]
  let style = {
    backgroundColor: `rgba(${red}, ${green}, ${blue}, 0.4)`,
  }
  return (
    <>
      <td className="athlete-name" style={style}>
        {headshot !== null ?
          (<img src={headshot} className="headshot" />) :
          null}
        <AthleteName name={athlete.name} />
      </td>
      <td className="score" style={style}>
        <ScoreAndProjection
          score={athlete.fpts}
          projection={project(athlete)}
        />
      </td>
    </>
  )
}

interface ScoreboardRowProps {
  contestant: Contestant
}

function ScoreboardRow({contestant}: ScoreboardRowProps) {
  return (
    <tr>
      <td>{contestant.name}</td>
      <td className="score">
        <ScoreAndProjection
          score={contestant.total}
          projection={contestant.lineup.map(project).reduce((f, g) => f + g, 0.0)}
        />
      </td>
      { contestant.lineup.map(athlete => (<AthleteCell athlete={athlete} />)) }
    </tr>
  )
}

class ScoreboardHeader extends React.Component {
  public render() {
    return (
      <thead>
        <th>Name</th>
        <th>Score</th>
        <th colSpan={2}>PG</th>
        <th colSpan={2}>SG</th>
        <th colSpan={2}>SF</th>
        <th colSpan={2}>PF</th>
        <th colSpan={2}>C</th>
      </thead>
    )
  }
}

interface ScoreboardBodyProps {
  lineups: LineupMap
}

class ScoreboardBody extends React.Component<ScoreboardBodyProps, {}> {
  public render() {
    let rows = Object.keys(this.props.lineups).map(
      contestant => (
        <ScoreboardRow
          contestant={Contestant(this.props.lineups, contestant)}
          key={contestant}
        />)
    )
    return (
      <tbody>
        {rows}
      </tbody>
    )
  }
}

interface ScoreboardProps {
  lineups: LineupMap
}

class Scoreboard extends React.Component<ScoreboardProps, {}> {
  public render() {
    return (
      <HTMLTable>
        <ScoreboardHeader />
        <ScoreboardBody lineups={this.props.lineups} />
      </HTMLTable>
    )
  }
}

interface AppState {
  data: LineupMap
  league: League
}

class App extends React.Component<{}, AppState> {
  public constructor(props: {}) {
    super(props)
    this.state = {
      data: {},
      league: GlobalLeague,
    }
  }

  public refreshScoreboard = () => {
    fetch('https://nba.uwseminars.com/api')
      .then(response => response.json())
      .then(response => {
        this.setState({ data: response })
      })
  }

  public componentDidMount() {
    this.refreshScoreboard()
    setInterval(this.refreshScoreboard, 60000)
  }

  public changeLeague = (league: League) => {
    this.setState({ league })
  }

  public render() {
    let filteredData = {}
    Object.keys(this.state.data).filter(this.state.league.filter).forEach(k => {
      filteredData[k] = this.state.data[k]
    })
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Fantasy NBA Live Scoreboard</h1>
          <LeagueSelect onSelect={this.changeLeague} />
        </header>
        <Scoreboard lineups={filteredData} />
      </div>
    )
  }
}

export default App
