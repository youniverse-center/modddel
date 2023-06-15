import { v4 as uuid } from 'uuid'
import type { AnyAggregate, AggregateId, AnyAggregateConstructor } from './Aggregate'

const isAggregateConstructor = (possibleConstructor: any): possibleConstructor is AnyAggregateConstructor => (
  typeof possibleConstructor === 'function' && Boolean(possibleConstructor.TYPE)
)

export interface EventMeta {}

export default class Event<A extends AnyAggregate, P> {
  #aggregateType?: string
  #aggregateId?: AggregateId<A>
  #version: number = 0

  public id: string
  public occuredAt: number
  public meta: EventMeta = {}

  public static get TYPE() {
    return 'Event'
  }

  public get type() {
    return Event.TYPE
  }

  public withSubject(aggregate: A) {
    this.#aggregateId = aggregate.aggregateId
    this.#aggregateType = aggregate.type
    this.#version = aggregate.version
  }

  constructor(
    public readonly payload: P,
    aggregateType?: string|AnyAggregateConstructor,
    aggregateId?: AggregateId<A>,
    version: number = 0
  ) {
    this.id = uuid()
    this.occuredAt = Date.now()
    this.#aggregateId = aggregateId
    this.#aggregateType = isAggregateConstructor(aggregateType) ? aggregateType.TYPE : aggregateType
    this.#version = version
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

  get version(): number {
    return this.#version
  }
}

export type EventPayload<E> = E extends Event<AnyAggregate, infer T> ? T : never
export type EventAggregate<E, F = never> = E extends Event<infer A, any> ? A : F
export type AnyEvent = Event<AnyAggregate, any>
export type EventHandler<T extends AnyEvent> = (event: T) => void
export type EventConstructor<T extends AnyEvent> = {
  new (...args: any[]): T,
  readonly TYPE: string,
}
export type EventType<T extends AnyEvent> = string|EventConstructor<T>
export type AnyEventType = EventType<AnyEvent>
