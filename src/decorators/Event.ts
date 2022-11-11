import Event, { AnyEvent, EventConstructor } from '../Event'

type AnyEventConstructor = EventConstructor<AnyEvent>

const events = new Map<string, AnyEventConstructor>()

export default (name: string) => <T extends AnyEventConstructor>(Constructor: T) => {
  class EventClass extends Constructor {
    constructor(...args: any[]) {
      super(...args)
    }

    static get TYPE() {
      return name
    }

    get type() {
      return name
    }
  }

  events.set(name, EventClass)

  return EventClass
}

export const getEventClass = (name: string): AnyEventConstructor | undefined => {
  return events.get(name)
}
