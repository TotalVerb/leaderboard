import * as React from 'react'
import './App.css'

import { HTMLTable } from "@blueprintjs/core"
import { GlobalLeague, League, LeagueSelect } from "./LeagueSelect"
import { Athlete, project, splitName } from './athlete'
import { ScoreAndProjection } from './ScoreAndProjection'
import { DateInput, IDateFormatProps } from "@blueprintjs/datetime"
import { DraftLineup } from './DraftLineup'
import { Headshot } from './Headshot'
import { fadeColor } from './fadeColor'

const jsDateFormatter: IDateFormatProps = {
    // note that the native implementation of Date functions differs between browsers
    formatDate: date => date.toISOString().slice(0, 10),
    parseDate: str => new Date(str),
    placeholder: "YYYY-MM-DD",
}

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
  let [firstName, lastName] = splitName(name)
  return (
    <>
      <span className="first-name">
        {firstName}
      </span>
      <mark>{lastName}</mark>
    </>
  )
}

function AthleteCell({athlete}: AthleteProps) {
  let style = {
    backgroundColor: fadeColor(athlete.color)
  }
  return (
    <>
      <td className="name athlete-name" style={style}>
        <Headshot name={athlete.name} alt="" />
        <AthleteName name={athlete.name} />
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
      <td className="name contestant-name">
        <span className="contestant">{contestant.name}</span>
        <ScoreAndProjection
          score={contestant.total}
          projection={contestant.lineup.map(project).reduce((f, g) => f + g, 0.0)}
        />
      </td>
      { contestant.lineup.map(athlete => (<AthleteCell key={athlete.name} athlete={athlete} />)) }
    </tr>
  )
}

class ScoreboardHeader extends React.Component {
  public render() {
    return (
      <thead>
        <tr className="hide-when-small">
          <th>Contestant</th>
          <th>PG</th>
          <th>SG</th>
          <th>SF</th>
          <th>PF</th>
          <th>C</th>
        </tr>
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
  date: Date | null
}

class App extends React.Component<{}, AppState> {
  public constructor(props: {}) {
    super(props)
    this.state = {
      data: {},
      league: GlobalLeague,
      date: null,
    }
  }

  public refreshScoreboard = () => {
    let url = 'https://nba.uwseminars.com/api'
    if (this.state.date !== null) {
      url = url + `?date=${jsDateFormatter.formatDate(this.state.date)}`
    }
    fetch(url)
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

  public changeDate = (date: Date) => {
    this.setState({ date }, this.refreshScoreboard)
  }

  public render() {
    let filteredData = {}
    Object.keys(this.state.data).filter(this.state.league.filter).forEach(k => {
      filteredData[k] = this.state.data[k]
    })
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Live Scoreboard</h1>
          <LeagueSelect onSelect={this.changeLeague} />
          <DateInput
            {...jsDateFormatter}
            onChange={this.changeDate}
            value={this.state.date}
            showActionsBar={true}
          />
        </header>
        <Scoreboard lineups={filteredData} />
        <DraftLineup />
      </div>
    )
  }
}

export default App
