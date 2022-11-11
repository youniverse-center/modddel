import { AnyAggregateConstructor, AnyAggregate } from '../Aggregate'
import { getEventHandler } from './When'
import BaseEvent, { AnyEvent } from '../Event'

const aggregates = new Map<string, AnyAggregateConstructor>()

export const getAggregateClass = (name: string): AnyAggregateConstructor | undefined => {
  return aggregates.get(name)
}

export interface AggregateMixin {
  popEvents(): AnyEvent[],
  replay(events: AnyEvent[]): void,
  version: number,
}

export default function Aggregate(name: string) {
  return <T extends AnyAggregateConstructor>(Constructor: T) => {
    class DecoratedAggregateClass extends Constructor implements AggregateMixin {
      public version: number = 0
      #recordedEvents: AnyEvent[] = []

      protected constructor(...args: any[]) {
        super(...args)
      }

      static get TYPE() {
        return name
      }

      public get type() {
        return name
      }

      public recordThat(event: AnyEvent) {
        this.version += 1
        event.withSubject(
          this,
          this.version,
        )
        this.#applyEvent(event)
        this.#recordedEvents.push(event)
      }

      #applyEvent(event: AnyEvent) {
        const handler = getEventHandler(Constructor, event.type)
        if (!handler) {
          return
        }

        (this as any)[handler](event)
      }

      public popEvents(): AnyEvent[] {
        const events = this.#recordedEvents
        this.#recordedEvents = []

        return events
      }

      public replay(events: AnyEvent[]): void {
        events.forEach((event) => {
          if (this.version !== event.version - 1) {
            throw new Error('Events are not replayed in occurance order')
          }

          this.version = event.version
          this.#applyEvent(event)
        })
      }
    }

    aggregates.set(name, DecoratedAggregateClass)

    return DecoratedAggregateClass
  }
}
