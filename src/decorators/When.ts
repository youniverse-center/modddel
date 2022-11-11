import { AnyEvent, EventConstructor } from '../Event'

const eventHandlers = new WeakMap<any, Record<string, string>>()

export const getEventHandler = (target: any, eventName: string) => {
  const handlers = eventHandlers.get(target)
  if (!handlers) {
    return undefined
  }

  return handlers[eventName]
}

export default function When(C: EventConstructor<AnyEvent>) {
  return (target: any, propName: string) => {
    let handlers = eventHandlers.get(target.constructor)
    if (!handlers) {
      handlers = {}
      eventHandlers.set(target.constructor, handlers)
    }
    handlers[(C as any).TYPE] = propName
  }
}
