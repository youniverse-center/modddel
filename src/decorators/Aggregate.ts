import type { AnyAggregateConstructor } from '../Aggregate'
import { getEventHandler } from './When'
import type { AnyEvent, EventConstructor } from '../Event'

const aggregates = new Map<string, AnyAggregateConstructor>()

export const getAggregateClass = (name: string): AnyAggregateConstructor | undefined => {
  return aggregates.get(name)
}

export interface AggregateMixin {
  popEvents(): AnyEvent[],
  replay(events: AnyEvent[]): void,
  version: number,
}

type MissingHandlerDeciderFn = (event: AnyEvent) => boolean
type MissingHandlerDeciderTypes = EventConstructor<AnyEvent>[]|RegExp|MissingHandlerDeciderFn|boolean

export interface AggregateOptions {
  ignoreMissingHandlers?: MissingHandlerDeciderTypes,
}

const isRegExp = (o: any): o is RegExp => typeof o === 'object' && typeof o.test === 'function'

const createIgnoreMissingDecider = (options: AggregateOptions): MissingHandlerDeciderFn => {
  let ignoreMissingHandler: (event: AnyEvent) => boolean
  const decider = options?.ignoreMissingHandlers ?? false

  if (typeof decider === 'function') {
    ignoreMissingHandler = decider
  } else if (Array.isArray(decider)) {
    const types = decider.map((eventConstructor) => eventConstructor.TYPE)
    ignoreMissingHandler = (event: AnyEvent) => types.includes(event.type)
  } else if (isRegExp(decider)) {
    ignoreMissingHandler = (event) => {
      return decider.test(event.type)
    }
  }else {
    ignoreMissingHandler = () => Boolean(options.ignoreMissingHandlers)
  }

  return ignoreMissingHandler
}

export default function Aggregate(name: string, options: AggregateOptions = {}) {
  if (aggregates.has(name)) {
    throw new Error(`Aggregate class for ${name} already defined.`)
  }

  let shouldIgnoreMissingHandler = createIgnoreMissingDecider(options)

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
        event.withSubject(this)
        this.#applyEvent(event)
        this.#recordedEvents.push(event)
      }

      #applyEvent(event: AnyEvent) {
        const handler = getEventHandler(Constructor, event.type)
        if (!handler) {
          if (!shouldIgnoreMissingHandler(event)) {
            throw new Error(`Missing handler for ${event.type} in ${this.type} aggregate.`)
          }

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
            throw new Error('Events are not replayed in correct order')
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
