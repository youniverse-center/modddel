import { describe, it, expect } from 'vitest'
import { BankAccount } from './BankAcount'

describe('BankAccount sample', () => {
  it('should add money to total when deposited', () => {
    const account = new BankAccount('123')
    account.deposit(100)

    expect(account.total).toBe(100)
  })

  it('should throw error when withdrawn more than total', () => {
    const account = new BankAccount('123')
    account.deposit(100)

    expect(() => {
      account.withdraw(200)
    }).toThrow(/insufficient funds/i)
  })

  it('should successfuly withdraw money if less than total', () => {
    const account = new BankAccount('123')
    account.deposit(100)
    account.withdraw(42)

    expect(account.total).toBe(58)
  })

  it('should throw error when depositing negative amount', () => {
    const account = new BankAccount('123')

    expect(() => {
      account.deposit(-100)
    }).toThrow(/amount must be greater than 0/i)
  })

  it('should throw error when withdrawing negative amount', () => {
    const account = new BankAccount('123')
    account.deposit(100)

    expect(() => {
      account.withdraw(-10)
    }).toThrow(/amount must be greater than 0/i)
  })
})
