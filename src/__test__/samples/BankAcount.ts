import { Aggregate, BaseAggregate, BaseEvent, Event, When } from '../../index'

@Event('acount.moneyDeposited')
class MoneyDeposited extends BaseEvent<BankAccount, { amount: number }> {}

@Event('acount.moneyWithdrawn')
class MoneyWithdrawn extends BaseEvent<BankAccount, { amount: number }> {}

@Aggregate('BankAccount')
class BankAccount extends BaseAggregate {
  #total: number = 0

  get total() {
    return this.#total
  }

  deposit(amount: number) {
    if (amount <= 0) {
      throw new Error('Amount must be greater than 0')
    }

    this.recordThat(new MoneyDeposited({
      amount,
    }))
  }

  withdraw(amount: number) {
    if (amount <= 0) {
      throw new Error('Amount must be greater than 0')
    }

    if (this.#total - amount < 0) {
      throw new Error('Insufficient funds')
    }

    this.recordThat(new MoneyWithdrawn({
      amount,
    }))
  }

  @When(MoneyDeposited)
  addToTotal(event: MoneyDeposited) {
    this.#total += event.payload.amount
  }

  @When(MoneyWithdrawn)
  substarctFromTotal(event: MoneyWithdrawn) {
    this.#total -= event.payload.amount
  }
}

export {
  BankAccount,
  MoneyDeposited,
  MoneyWithdrawn,
}
