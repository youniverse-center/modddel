import { AggregateId, AnyAggregate, createFromHistory } from '../Aggregate'
import BaseEvent from '../Event'

export interface IStorage {
  loadByAggregateId<A extends AnyAggregate>(aggregateId: AggregateId<A>): BaseEvent<A, any>[],
}

export default class EventStore<S extends IStorage> {
  constructor(
    private storage: S
  ) {}

  loadAggregate<A extends AnyAggregate>(id: AggregateId<A>): A|undefined {
    const events = this.storage.loadByAggregateId<A>(id)

    return createFromHistory(events)
  }
}
