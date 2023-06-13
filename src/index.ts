import BaseAggregate, {
  popEvents,
  type AggregateConstructor,
  type AggregateId,
  type AnyAggregate,
  type AnyAggregateConstructor,
} from './Aggregate'
import Aggregate, {
  getAggregateClass,
  type AggregateMixin,
} from './decorators/Aggregate'
import BaseEvent, {
  type AnyEvent,
  type AnyEventType,
  type EventHandler,
  type EventType,
  type EventPayload,
} from './Event'
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
