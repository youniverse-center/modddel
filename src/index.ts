import BaseAggregate, {
  popEvents,
  AggregateConstructor,
  AggregateId,
  AnyAggregate,
  AnyAggregateConstructor,
} from './Aggregate'
import Aggregate, {
  getAggregateClass,
  type AggregateMixin,
} from './decorators/Aggregate'
import BaseEvent, {
  AnyEvent,
  AnyEventType,
  EventHandler,
  EventType,
  EventPayload,
}  from './Event'
import Event, {
  getEventClass,
} from './decorators/Event'
import When from './decorators/When'

export {
  BaseAggregate,
  Aggregate,
  AggregateMixin,
  BaseEvent,
  Event,
  When,
  getAggregateClass,
  getEventClass,
  popEvents,
}

export type {
  AggregateConstructor,
  AggregateId,
  AnyAggregate,
  AnyAggregateConstructor,
  AnyEvent,
  AnyEventType,
  EventHandler,
  EventType,
  EventPayload,
}
