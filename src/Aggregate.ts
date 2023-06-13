import { getAggregateClass, type AggregateMixin } from './decorators/Aggregate'
import type BaseEvent from './Event'
import type { AnyEvent, EventAggregate } from './Event'

export type AggregateId<A> = A extends BaseAggregate<infer I> ? I : never
export type AnyAggregate = BaseAggregate<any>
export type AggregateConstructor<T extends AnyAggregate> = {
  new(...args: any[]): T,
  readonly TYPE: string,
}
export type AnyAggregateConstructor = AggregateConstructor<AnyAggregate>

export default abstract class BaseAggregate<I = string> {
  public version = 0
  #aggregateId: I

  public constructor(aggregateId: I) {
    this.#aggregateId = aggregateId
  }

  static get TYPE(): string {
    throw new Error('Aggregate class must be decorated with Aggregate')
  }

  public get type(): string {
    throw new Error('Aggregate class must be decorated with Aggregate')
  }

  protected recordThat(_event: AnyEvent) {
    throw new Error('Aggregate class must be decorated with Aggregate')
  }

  get aggregateId() {
    return this.#aggregateId
  }
}

const popEvents = (aggregate: AnyAggregate) => {
  return (aggregate as unknown as AggregateMixin).popEvents()
}

function createFromHistory<E extends BaseEvent<AnyAggregate, any>>(events: E[]): EventAggregate<E>|undefined {
  if (!events.length) {
    return undefined
  }

  const [firstEvent] = events
  const AggregateClass = getAggregateClass(firstEvent.aggregateType) as AggregateConstructor<EventAggregate<E>>
  if (!AggregateClass) {
    throw new Error(`${firstEvent.aggregateType} is not an aggregate`)
  }

  const aggregate = new AggregateClass(firstEvent.aggregateId)
  const thisAggregate = aggregate as unknown as AggregateMixin
  thisAggregate.replay(events)

  return aggregate
}

export {
  popEvents,
  createFromHistory,
}
