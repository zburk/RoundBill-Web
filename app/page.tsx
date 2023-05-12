"use client";

import Image from 'next/image'
import { Fragment, ReactNode, useEffect, useMemo, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'

class RoundedBill {
  readonly billTotalWithoutTip: number
  readonly billTotalWithTip: number    
  constructor(billTotalWithoutTip: number, billTotalWithTip: number) {
    this.billTotalWithoutTip = billTotalWithoutTip;
    this.billTotalWithTip = billTotalWithTip;
  }

  get tipAmount(): number {
    return this.billTotalWithTip - this.billTotalWithoutTip
  }

  get tipPercentage(): number {
    return this.tipAmount / (this.billTotalWithTip - this.tipAmount)
  }
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const PREFERRED_TIP_PERCENTAGE = 0.18
const PREFERRED_BILL_INCREMENT = 0.50

function FormattedBill({ bill }: { bill: RoundedBill }) {
  return <div className="flex flex-row justify-between">
    <span>{percentFormatter.format(bill.tipPercentage ?? 0)} Tip</span>
    <span>{currencyFormatter.format(bill.tipAmount ?? 0)}</span>
  </div>
}

export default function Home() {
  const [billTotalInput, setBillTotal] = useState('')

  const billTotal = parseFloat(billTotalInput)

  const [personCount, setPersonCount] = useState(1)

  const standardBill = useMemo(
    () => new RoundedBill(billTotal, billTotal * (1 + PREFERRED_TIP_PERCENTAGE)),
    [billTotal]
  )

  const billIncrements = useMemo(
    () => {
      const billIncrements: RoundedBill[] = [];
      for (var i = billTotal; i < billTotal * 2; i = i + PREFERRED_BILL_INCREMENT) {
        billIncrements.push(new RoundedBill(billTotal, i));
      }

      if (billTotal > 0 && !billIncrements.some(bill => bill.billTotalWithTip === standardBill.billTotalWithTip)) {
        billIncrements.push(standardBill)
      }

      billIncrements.sort((a, b) => a.billTotalWithTip - b.billTotalWithTip)

      return billIncrements;
    },
    [billTotal, standardBill]
  );

  const [selectedBillIncrement, setSelectedBillIncrement] = useState<RoundedBill | undefined>(billIncrements[0])

  useEffect(() => {
    const preferredTip = billIncrements.find(bill => bill.billTotalWithTip === standardBill.billTotalWithTip)

    setSelectedBillIncrement(preferredTip ?? billIncrements[0])
  }, [billIncrements, standardBill.billTotalWithTip])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-black">
      <div className="max-w-screen-sm">
        <form className="pb-4">
          <input
            className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-2 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm"
            type="text"
            placeholder="Bill Total:"
            value={billTotalInput}
            pattern="[0-9]+([\.][0-9]{1,2})?"
            onChange={(e) => setBillTotal(e.target.value)}
            inputMode="decimal" />

          {
            billIncrements.length > 0 && <div className="w-72">
              <Listbox value={selectedBillIncrement} onChange={setSelectedBillIncrement}>
                <div className="relative mt-1 z-10">
                  <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                    <span className="block truncate">{selectedBillIncrement && <FormattedBill bill={selectedBillIncrement} />}</span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <ChevronUpDownIcon
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </span>
                  </Listbox.Button>
                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                      {billIncrements.map(billIncrement => (
                        <Listbox.Option
                          key={billIncrement.billTotalWithTip}
                          className={({ active }) =>
                            `relative cursor-default select-none py-2 pl-10 pr-6 ${
                              active ? 'bg-amber-100 text-amber-900' : 'text-gray-900'
                            }`
                          }
                          value={billIncrement}
                        >
                          {({ selected }) => (
                            <>
                              <span
                                className={`block truncate ${
                                  selected ? 'font-medium' : 'font-normal'
                                }`}
                              >
                                <FormattedBill bill={billIncrement} />
                              </span>
                              {selected ? (
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                                  <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                </span>
                              ) : null}
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
            </div>
          }

          <Listbox value={personCount} onChange={setPersonCount}>
            <div className="relative mt-1">
              <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                <span className="truncate flex justify-between w-full"><span>People</span> <span>{personCount}</span></span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </span>
              </Listbox.Button>
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  { Array.from(Array(50).keys()).map(i => (
                  <Listbox.Option
                    key={i}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-6 ${
                        active ? 'bg-amber-100 text-amber-900' : 'text-gray-900'
                      }`
                    }
                    value={i + 1}
                  >
                    {({ selected }) => (
                      <>
                        <span
                          className={`block w-full text-right truncate ${
                            selected ? 'font-medium' : 'font-normal'
                          }`}
                        >
                          {i + 1}
                        </span>
                        {selected ? (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>
        </form>

        <div className="flex flex-col items-end w-full text-white">
          <div className="font-medium text-3xl">
            {currencyFormatter.format(selectedBillIncrement?.billTotalWithTip ?? 0)}
          </div>
          <div className="text-gray-400">
            { personCount <= 1 ? <span className="font-bold">Total</span> : <span><span className="font-bold">{currencyFormatter.format((selectedBillIncrement?.billTotalWithTip ?? 0) / personCount)}</span> each</span>}
          </div>
        </div>
      </div>
    </main>
  )
}
