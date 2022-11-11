import { v4 as uuid } from 'uuid'
import BaseAggregate, { AnyAggregate, AggregateId } from './Aggregate'

export default class Event<A extends AnyAggregate, P> {
  #aggregateType?: string
  #aggregateId?: AggregateId<A>

  public id: string
  public version: number = 0
  public occuredAt: number
  public meta: any = {}

  public static get TYPE() {
    return 'Event'
  }

  public get type() {
    return Event.TYPE
  }

  public withSubject(aggregate: A, version?: number) {
    this.#aggregateId = aggregate.aggregateId
    this.#aggregateType = aggregate.type
    if (version) {
      this.version = version
    }
  }

  constructor(
    public readonly payload: P,
    aggregateType?: string,
    aggregateId?: AggregateId<A>
  ) {
    this.id = uuid()
    this.occuredAt = Date.now()
  }

  get aggregateId(): AggregateId<A> {
    if (!this.#aggregateId) {
      throw new Error('Event not created for aggregate')
    }

    return this.#aggregateId
  }

  get aggregateType(): string {
    if (!this.#aggregateType) {
      throw new Error('Event not created for aggregate')
    }

    return this.#aggregateType
  }
}

export type EventPayload<E> = E extends Event<AnyAggregate, infer T> ? T : never
export type EventAggregate<E> = E extends Event<infer A, any>  ? A : never
export type AnyEvent = Event<AnyAggregate, unknown>
export type EventHandler<T extends AnyEvent> = (event: T) => void
export type EventConstructor<T extends AnyEvent> = {
  new (...args: any[]): T,
  readonly TYPE: string,
}
export type EventType<T extends AnyEvent> = string|EventConstructor<T>
export type AnyEventType = EventType<AnyEvent>

const typeToString = (type: EventType<AnyEvent>) => (
  typeof type === 'function' ? type.TYPE : type
)
