import * as React from 'react'
import { Button, MenuItem } from '@blueprintjs/core'
import { ItemRenderer, Select } from "@blueprintjs/select";

export interface League {
  name: string
  filter: (name: string) => boolean
}

function makeLeagueFromPlayerList(name: string, list: Array<string>) {
  return {
    name,
    filter: (name: string) => list.indexOf(name) !== -1,
  }
}

export const GlobalLeague = {
  name: 'Global',
  filter: (name: string) => true,
}

const Leagues: Array<League> = [
  GlobalLeague,
  makeLeagueFromPlayerList(
    'Math bois',
    ['Adam', 'Fengyang', 'Kai', 'Manas', 'Mohamed', 'Sina', 'Zihao'],
  ),
  makeLeagueFromPlayerList(
    'Guacamole bay',
    ['Sina', 'Zihao'],
  ),
]

const LeagueSelectComponent = Select.ofType<League>();

interface LeagueSelectProps {
  onSelect: (league: League) => void
}

const renderLeague: ItemRenderer<League> = (league, { handleClick, modifiers }) => (
  <MenuItem
    active={modifiers.active}
    key={league.name}
    onClick={handleClick}
    text={league.name}
  />
)

export function LeagueSelect({ onSelect }: LeagueSelectProps) {
  return (
    <LeagueSelectComponent
      filterable={false}
      items={Leagues}
      itemRenderer={renderLeague}
      onItemSelect={onSelect}
    >
      <Button icon="th-list" text="Select League" />
    </LeagueSelectComponent>
  )
}
