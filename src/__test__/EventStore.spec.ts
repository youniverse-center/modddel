import { describe, it, expect } from 'vitest'
import EventStore, { IStorage } from '../EventStore'
import { BaseEvent, type AnyAggregate, type AggregateId, type AnyEvent, BaseAggregate, Aggregate, Event } from '../index'
import { BankAccount, MoneyDeposited, MoneyWithdrawn } from './samples/BankAcount'

class InMemoryStorage implements IStorage {
  public events: AnyEvent[] = []

  loadByAggregateId<A extends AnyAggregate>(aggregateId: AggregateId<A>): BaseEvent<A, any>[] {
    const aggregateEvents = this.events.filter((event) => event.aggregateId === aggregateId)
    aggregateEvents.sort((a, b) => a.version - b.version)

    return aggregateEvents as BaseEvent<A, any>[]
  }

}

type State = {
  id: string,
  amount: number,
}[]

const createEventStore = (initialState: State) => {
  const storage = new InMemoryStorage()
  const eventStore = new EventStore(storage)

  const versions: Record<string, number> = {}

  initialState.forEach((entry) => {
    const {id, amount} = entry
    const version = (versions[id] ?? 0) + 1
    versions[id] = version
    if (amount >= 0) {
      storage.events.push(new MoneyDeposited({amount}, BankAccount, id, version))
    } else {
      storage.events.push(new MoneyWithdrawn({amount: -amount}, BankAccount, id, version))
    }
  })

  return { eventStore, storage }
}

describe('EventStore', () => {
  it('should load aggregate by id', () => {
    const { eventStore } = createEventStore([
      {amount: 10, id: 'A'},
      {amount: 10, id: 'B'},
      {amount: 10, id: 'C'},
      {amount: 10, id: 'A'},
      {amount: -8, id: 'A'},
    ])

    const account = eventStore.loadAggregate<BankAccount>('A')
    expect(account?.total).toBe(12)
    expect(account?.version).toBe(3)
  })
})
