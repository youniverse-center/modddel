import { describe, it, expect } from 'vitest'
import BaseAggregate, { AnyAggregate } from '../Aggregate'
import Aggregate, { getAggregateClass } from '../decorators/Aggregate'
import Event from '../decorators/Event'
import BaseEvent from '../Event'
import When from '../decorators/When'

@Event('HandledEvent')
class HandledEvent extends BaseEvent<AnyAggregate, void> {}

@Event('NotHandledEvent')
class NotHandledEvent extends BaseEvent<AnyAggregate, void> {}

@Event('IgnoredHandleEvent')
class IgnoredHandleEvent extends BaseEvent<AnyAggregate, void> {}

@Aggregate('SomeAggregate', {
  ignoreMissingHandlers: [IgnoredHandleEvent],
})
class SomeAggregate extends BaseAggregate {
  public eventHandled = false

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
      }).throws('Aggregate class for SomeAggregate already defined.')
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
      }).not.throws()
    })

    it('should ignore any events when decider set to true', () => {
      @Aggregate('SomeAggregateA', {
        ignoreMissingHandlers: true,
      })
      class OtherAggregateA extends BaseAggregate {
        doIt() {
          this.recordThat(new NotHandledEvent())
        }
      }

      const aggregate = new OtherAggregateA('#3')
      expect(() => {
        aggregate.doIt()
      }).not.throws()
    })

    describe('IgnoreMissingHandlers as regexp', () => {
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
        }).not.throws()
      })

      it('should throw error not matching regexp', () => {
        const aggregate = new OtherAggregateB('#4')
        expect(() => {
          aggregate.dontDoIt()
        }).throws(/missing handler/i)
      })
    })

  })
})
