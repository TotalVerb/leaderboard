import * as React from 'react'
import {
  Button, Popover, Card,
  Intent, Tab, Tabs,
  H1, H2, InputGroup, Tooltip, ControlGroup,
  Spinner,
} from '@blueprintjs/core'
import { Headshot } from './Headshot'
import { splitName } from './athlete'
import { fadeColor } from './fadeColor'

interface DraftOption {
  name: string
  salary: number
  average: number
  position: number
  team: string
  color: string
  out: boolean
  game_time: string
  projection: number
  id: number
}

type DraftCategory = 'PG' | 'SG' | 'SF' | 'PF' | 'C'

interface DraftData {
  PG: Array<DraftOption>
  SG: Array<DraftOption>
  SF: Array<DraftOption>
  PF: Array<DraftOption>
  C: Array<DraftOption>
  deadline: string
}
type DraftSelection = {
  [K in DraftCategory]: number | null
}

interface OptionCardProps {
  option: DraftOption
  onPlayerSelect: (id: number) => void
  selected: boolean
}

export class OptionCard extends React.Component<OptionCardProps, {}> {
  public render () {
    let classes = ['option']
    let [firstName, lastName] = splitName(this.props.option.name)
    if (this.props.selected) classes.push('selected')
    return (
      <Button
        text={<div>
          <span className="firstname">{firstName}</span>
          <H2>{lastName}</H2>
          <Headshot name={this.props.option.name} alt="" />
          <span className="salary">{this.props.option.salary}K</span>{'\n'}
          <span className="average">{
            this.props.option.out
            ? 'OUT'
            : this.props.option.average.toFixed(1)
          }</span>
        </div>}
        onClick={this.selectPlayer}
        className={classes.join(' ')}
        style={{
          backgroundColor: fadeColor(this.props.option.color)
        }}
      />
    )
  }

  public selectPlayer = () => {
    this.props.onPlayerSelect(this.props.option.id)
  }
}

interface DraftPanelProps {
  category: DraftCategory
  options: Array<DraftOption>
  selected: number | null
  onPlayerSelect: (id: number) => void
}

export class DraftPanel extends React.Component<DraftPanelProps, {}> {
  public render () {
    return (
      <div className="draftpanel">
        <H1>{this.props.category}</H1>
        {this.props.options.map(option => (
          <OptionCard
            option={option}
            key={option.id}
            onPlayerSelect={this.props.onPlayerSelect}
            selected={option.id === this.props.selected}
          />
        ))}
      </div>
    )
  }
}

interface DraftCardProps {
  data: DraftData
}

interface DraftCardState {
  selectedTabId: string
  selected: DraftSelection
  showPassword: boolean
  token: string
}

export class DraftCard extends React.Component<DraftCardProps, DraftCardState> {
  public constructor (props: DraftCardProps) {
    super(props)
    let initialLineup = {
      PG: null,
      SG: null,
      SF: null,
      PF: null,
      C: null,
    }
    if (localStorage.selected) {
      try {
        let lineup = JSON.parse(localStorage.selected)
        Object.keys(initialLineup).forEach(k => {
          if (this.props.data[k].filter((x: DraftOption) => x.id === lineup[k]).length !== 0) {
            initialLineup[k] = Number(lineup[k])
          }
        })
      } catch (e) {}
    }
    this.state = {
      selectedTabId: 'PG',
      selected: initialLineup,
      showPassword: false,
      token: localStorage.token ? localStorage.token : "",
    }
  }

  public onTokenChange = (evt: React.FormEvent<HTMLInputElement>) => {
    let token = evt.currentTarget.value
    this.setState({
      token,
    }, () => {
      localStorage.token = this.state.token
    })
  }

  public handleLockClick = () => {
    this.setState({
      showPassword: !this.state.showPassword,
    })
  }

  public render() {
    const showPassword = this.state.showPassword
    const lockButton = (
      <Tooltip content={`${showPassword ? "Hide" : "Show"} Token`}>
        <Button
          icon={showPassword ? "unlock" : "lock"}
          intent={Intent.WARNING}
          minimal={true}
          onClick={this.handleLockClick}
        />
      </Tooltip>
    )
    let remainingSalary = this.getRemainingSalary()
    return (
      <Card>
        <ControlGroup fill={true}>
          <InputGroup
            placeholder="Token"
            rightElement={lockButton}
            onChange={this.onTokenChange}
            value={this.state.token}
            type={showPassword ? "text" : "password"}
          />
          <Button
            text="Send"
            disabled={remainingSalary < 0 || !this.allSelected()}
            onClick={this.submitLineup}
          />
        </ControlGroup>
        <Tabs
          id="TabsExample"
          onChange={this.handleTabChange}
          selectedTabId={this.state.selectedTabId}
        >
          {this.getDraftTab('PG')}
          {this.getDraftTab('SG')}
          {this.getDraftTab('SF')}
          {this.getDraftTab('PF')}
          {this.getDraftTab('C')}
          <Tabs.Expander />
          {this.props.data.deadline.trim()}
          <br />
          {remainingSalary}K left{' '}
        </Tabs>
      </Card>
    )
  }

  public selectPlayer = (category: DraftCategory) => (id: number) => {
    this.setState({
      selected: Object.assign(this.state.selected, {[category]: id})
    }, () => {
      localStorage.selected = JSON.stringify(this.state.selected)
    })
  }

  public submitLineup = () => {
    let url = 'https://nba.uwseminars.com/submit_lineup'
    let formData = new FormData()
    for (let position of ['PG', 'SG', 'SF', 'PF', 'C']) {
      formData.set(position, String(this.state.selected[position]))
    }
    formData.set('password', this.state.token)
    fetch(url, {
      method: 'post',
      body: formData,
    })
    .then(body => body.text())
    .then(body => {
      alert(body)
    })
  }

  allSelected () {
    return Object.keys(this.state.selected).filter(
      k => this.state.selected[k] === null
    ).length === 0
  }

  getRemainingSalary () {
    return 300 - Object.keys(this.state.selected).map(k => {
      let id = this.state.selected[k]
      if (id !== null) {
        let player = this.props.data[k].filter((x: DraftOption) => x.id === id)[0]
        return player.salary
      } else {
        return 0
      }
    }).reduce((f, g) => f + g, 0.0)
  }

  getTitle (category: DraftCategory) {
    if (this.state.selected[category] !== null) {
      let id = this.state.selected[category]
      let player = this.props.data[category].filter(x => x.id === id)[0]
      return (
        <>
          <Headshot name={player.name} alt={category} />
          <br />
          {player.salary}
        </>
      )
    } else {
      return category
    }
  }

  public getDraftTab (category: DraftCategory) {
    return (
      <Tab
        className="drafttab"
        id={category}
        title={this.getTitle(category)}
        panel={(
          <DraftPanel
            category={category}
            options={this.props.data[category]}
            selected={this.state.selected[category]}
            onPlayerSelect={this.selectPlayer(category)}
          />
        )}
      />
    )
  }

  public handleTabChange = (newTabId: DraftCategory) => {
    this.setState({
      selectedTabId: newTabId
    })
  }
}

interface DraftLineupState {
  data: DraftData | null
}

export class DraftLineup extends React.Component<{}, DraftLineupState> {
  public constructor(props: {}) {
    super(props)
    this.state = {
      data: null,
    }
  }

  public loadDraftAPI = () => {
    let url = 'https://nba.uwseminars.com/draftapi'
    fetch(url)
      .then(response => response.json())
      .then(response => {
        this.setState({ data: response })
      })
  }

  public render () {
    return (
      <Popover onOpening={this.loadDraftAPI} >
        <Button text="Draft Lineup" />
        {this.state.data === null ? (<Card>
          <Spinner />
        </Card>) : <DraftCard data={this.state.data} />}
      </Popover>
    )
  }
}
