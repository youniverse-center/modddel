import { EventAggregate } from './../Event'
import { describe, it, expect } from 'vitest'
import BaseAggregate, { AnyAggregate, createFromHistory, popEvents } from '../Aggregate'
import Aggregate, { getAggregateClass } from '../decorators/Aggregate'
import Event, { getEventClass } from '../decorators/Event'
import BaseEvent, { AnyEvent } from '../Event'
import When from '../decorators/When'

@Event('HandledEvent')
class HandledEvent extends BaseEvent<AnyAggregate, void> {}

@Event('NotHandledEvent')
class NotHandledEvent extends BaseEvent<AnyAggregate, void> {}

@Event('IgnoredHandleEvent')
class IgnoredHandleEvent extends BaseEvent<AnyAggregate, void> {}

@Event('HistoryEvent')
class HistoryEvent extends BaseEvent<SomeAggregate, { messageFromPast: string }> {}

class MissingAnnotationEvent extends BaseEvent<AnyAggregate, void> {}

@Aggregate('SomeAggregate', {
  ignoreMissingHandlers: [IgnoredHandleEvent],
})
class SomeAggregate extends BaseAggregate {
  public eventHandled = false
  public messageFromPast = ''

  handleEvent() {
    this.recordThat(new HandledEvent())
  }

  dontHandleEvent() {
    this.recordThat(new NotHandledEvent())
  }

  ignoreHandleEvent() {
    this.recordThat(new IgnoredHandleEvent())
  }

  @When(HandledEvent)
  onHandledEvent(_event: HandledEvent) {
    this.eventHandled = true
  }

  @When(HistoryEvent)
  setMessageFromPast(event: HistoryEvent) {
    this.messageFromPast = event.payload.messageFromPast
  }
}

class MissingAnnotaionAggregate extends BaseAggregate<number> {
  doSomething() {
    this.recordThat(new HandledEvent())
  }
}

describe('Aggregate', () => {

  describe('getAggregateClass', () => {
    it('should return aggregate class by name', () => {
      expect(getAggregateClass('SomeAggregate')).toBe(SomeAggregate)
    })
    it('should throw exception on duplicate aggregate name', () => {
      expect(() => {
        @Aggregate('SomeAggregate')
        class OtherAggregate extends BaseAggregate {
        }
      }).toThrow('Aggregate class for SomeAggregate already defined.')
    })
  })

  describe('handling events', () => {
    it('should handle event', () => {
      const aggregate = new SomeAggregate('#1')
      aggregate.handleEvent()

      expect(aggregate.eventHandled).toBe(true)
    })

    it('should ignore missing handler defined as array of event constructors', () => {
      const aggregate = new SomeAggregate('#2')
      expect(() => {
        aggregate.ignoreHandleEvent()
      }).not.toThrow()
    })

    describe('Option ignoreMissingHandlers as boolean', () => {
      it('should ignore any events when decider set to true', () => {
        @Aggregate('SomeAggregateA_1', {
          ignoreMissingHandlers: true,
        })
        class OtherAggregateA_1 extends BaseAggregate {
          doIt() {
            this.recordThat(new NotHandledEvent())
          }
        }

        const aggregate = new OtherAggregateA_1('#3')
        expect(() => {
          aggregate.doIt()
        }).not.toThrow()
      })

      it('should always throw exception by default', () => {
        @Aggregate('SomeAggregateA_2')
        class OtherAggregateA_2 extends BaseAggregate {
          doIt() {
            this.recordThat(new NotHandledEvent())
          }
        }

        const aggregate = new OtherAggregateA_2('#3')
        expect(() => {
          aggregate.doIt()
        }).toThrow(/missing handler/i)
      })
    })

    describe('Option ignoreMissingHandlers as list of events', () => {
      @Aggregate('SomeAggregateC', {
        ignoreMissingHandlers: [IgnoredHandleEvent],
      })
      class OtherAggregateC extends BaseAggregate {
        doIt() {
          this.recordThat(new IgnoredHandleEvent())
        }
        dontDoIt() {
          this.recordThat(new NotHandledEvent())
        }
      }

      it('should ignore events matching regexp', () => {
        const aggregate = new OtherAggregateC('#5')
        expect(() => {
          aggregate.doIt()
        }).not.toThrow()
      })

      it('should throw error not matching regexp', () => {
        const aggregate = new OtherAggregateC('#6')
        expect(() => {
          aggregate.dontDoIt()
        }).toThrow(/missing handler/i)
      })
    })
  })

  describe('Option ignoreMissingHandlers as regexp', () => {
    @Aggregate('SomeAggregateB', {
      ignoreMissingHandlers: /^ignored/i,
    })
    class OtherAggregateB extends BaseAggregate {
      doIt() {
        this.recordThat(new IgnoredHandleEvent())
      }
      dontDoIt() {
        this.recordThat(new NotHandledEvent())
      }
    }

    it('should ignore events matching regexp', () => {
      const aggregate = new OtherAggregateB('#4')
      expect(() => {
        aggregate.doIt()
      }).not.toThrow()
    })

    it('should throw error not matching regexp', () => {
      const aggregate = new OtherAggregateB('#4')
      expect(() => {
        aggregate.dontDoIt()
      }).toThrow(/missing handler/i)
    })
  })

  describe('Option ignoreMissingHandlers as function', () => {
    @Aggregate('SomeAggregateD', {
      ignoreMissingHandlers: (event: BaseEvent<OtherAggregateD, void>) => event.type === IgnoredHandleEvent.TYPE,
    })
    class OtherAggregateD extends BaseAggregate {
      doIt() {
        this.recordThat(new IgnoredHandleEvent())
      }
      dontDoIt() {
        this.recordThat(new NotHandledEvent())
      }
    }

    it('should ignore events matching regexp', () => {
      const aggregate = new OtherAggregateD('#8')
      expect(() => {
        aggregate.doIt()
      }).not.toThrow()
    })

    it('should throw error not matching regexp', () => {
      const aggregate = new OtherAggregateD('#12')
      expect(() => {
        aggregate.dontDoIt()
      }).toThrow(/missing handler/i)
    })
  })

  describe('pop events', () => {
    it('should return recorded events', () => {
      const aggregate = new SomeAggregate('#1')
      aggregate.handleEvent()
      aggregate.handleEvent()

      const events = popEvents(aggregate).map((event) => ({
        aggregateId: event.aggregateId,
        aggregateType: event.aggregateType,
        type: event.type,
        version: event.version,
      }))

      expect(events).toStrictEqual([
        expect.objectContaining({
          aggregateId: '#1',
          aggregateType: 'SomeAggregate',
          type: 'HandledEvent',
          version: 1,
        }),
        expect.objectContaining({
          aggregateId: '#1',
          aggregateType: 'SomeAggregate',
          type: 'HandledEvent',
          version: 2,
        }),
      ])
    })

    it('should empty recorded events log after poping', () => {
      const aggregate = new SomeAggregate('#1')
      aggregate.handleEvent()
      aggregate.handleEvent()

      popEvents(aggregate)
      const secondPop = popEvents(aggregate)

      expect(secondPop.length).toBe(0)
    })

    it('should recreate aggregate from history', () => {
      const events = [
        new HistoryEvent({
          messageFromPast: 'The ultimate question was asked',
        }, SomeAggregate, '#42', 1),
      ]

      const aggregate = createFromHistory(events)
      expect(aggregate?.aggregateId).toBe('#42')
      expect(aggregate?.type).toBe(SomeAggregate.TYPE)
      expect(aggregate?.messageFromPast).toBe('The ultimate question was asked')
    })

    it('should throw error when creating from history with not sorted events', () => {
      const events = [
        new HistoryEvent({
          messageFromPast: 'Newer',
        }, SomeAggregate, '#42', 2),
        new HistoryEvent({
          messageFromPast: 'Older',
        }, SomeAggregate, '#42', 1),
      ]

      expect(() => {
        createFromHistory(events)
      }).toThrow(/events are not replayed in correct order/i)
    })

    it('should throw an error when no aggregate class is used for event', () => {
      const events = [
        new HandledEvent(undefined, 'MissingAnnotaionAggregate', 1, 1),
      ]

      expect(() => {
        createFromHistory(events)
      }).toThrow(/is not an aggregate/i)
    })

    it('should throw an error when event is not corelated with aggregate type', () => {
      const events = [
        new HandledEvent(undefined),
      ]

      expect(() => {
        createFromHistory(events)
      }).toThrow(/not created for aggregate/i)
    })

    it('should throw an error when event is not corelated with aggregate id', () => {
      const events = [
        new HandledEvent(undefined, SomeAggregate),
      ]

      expect(() => {
        createFromHistory(events)
      }).toThrow(/not created for aggregate/i)
    })

    it('should return undefined on empty history', () => {
      expect(createFromHistory([])).toBe(undefined)
    })
  })

  describe('not anotated agregate class', () => {
    it('should throw when getting type from class', () => {
      expect(() => {
        MissingAnnotaionAggregate.TYPE
      }).toThrow(/must be decorated/i)
    })

    it('should throw when getting type from instance', () => {
      expect(() => {
        const aggregate = new MissingAnnotaionAggregate(1)
        aggregate.type
      }).toThrow(/must be decorated/i)
    })

    it('should throw when recording event', () => {
      expect(() => {
        const aggregate = new MissingAnnotaionAggregate(1)
        aggregate.doSomething()
      }).toThrow(/must be decorated/i)
    })
  })

  describe('not anotated event class', () => {
    it('TYPE on class should be Event', () => {
      expect(MissingAnnotationEvent.TYPE).toBe('Event')
    })

    it('type on instance shoud be Event', () => {
      const event = new MissingAnnotationEvent()
      expect(event.type).toBe('Event')
    })
  })

  it('should return event class by name', () => {
    expect(getEventClass('NotHandledEvent')).toBe(NotHandledEvent)
  })
})
