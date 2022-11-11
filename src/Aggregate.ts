import { getAggregateClass, AggregateMixin } from './decorators/Aggregate'
import { AnyEvent } from './Event'

export type AggregateId<A> = A extends BaseAggregate<infer I> ? I : never
export type AnyAggregate = BaseAggregate<any>
export type AggregateConstructor<T extends AnyAggregate> = new (...args: any[]) => T
export type AnyAggregateConstructor = AggregateConstructor<AnyAggregate>

export default abstract class BaseAggregate<I = string> {
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

const createFromHistory = (events: AnyEvent[]) => {
  if (!events.length) {
    return null
  }

  const [firstEvent] = events
  if (!firstEvent.aggregateType || !firstEvent.aggregateId) {
    throw new Error('Event was not created for any aggregate')
  }
  const AggregateConstructor = getAggregateClass(firstEvent.aggregateType)
  if (!AggregateConstructor) {
    throw new Error(`${firstEvent.aggregateType} is not an aggregate`)
  }
  const aggregate = new AggregateConstructor(firstEvent.aggregateId)
  const thisAggregate = aggregate as unknown as AggregateMixin
  thisAggregate.replay(events)

  return aggregate
}

export {
  popEvents,
  createFromHistory,
}
