import HeaderBox from '@/components/HeaderBox'
import { Pagination } from '@/components/Pagination'
import TransactionsTable from '@/components/transaction-history/TransactionsTable'
import { getAccount, getAccounts } from '@/lib/actions/bank.action'
import { getLoggedInUser } from '@/lib/actions/user.actions'
import { formatAmount } from '@/lib/utils'
import React from 'react'

const Transaction = async({searchParams : {id,page}}: SearchParamProps) => {
  const currentPage = Number(page as string) || 1
  const loggedIn = await getLoggedInUser()
  const accounts = await getAccounts({userId:loggedIn.$id})

  if (!accounts) return
  
  const accountsData = accounts.data
  const appwriteItemId = (id as string) || accountsData[0]?.appwriteItemId

  const account = await getAccount({appwriteItemId})
  const {transactions} = account

  const rowsPerPage = 10;
  const totalPages = Math.ceil(transactions?.length / rowsPerPage)
  
  const indexOfLastTransaction = currentPage * rowsPerPage

  const indexOfFirstTransaction = indexOfLastTransaction - rowsPerPage

  const currentTransactions = transactions?.slice(indexOfFirstTransaction,indexOfLastTransaction)

  return (
    <section className='transaction'>
      <div className="transactions-header">
        <HeaderBox title='Transaction History' subtext='See your bank details and transactions' />
      </div>

      <div className='space-y-6'>
        <div className="transactions-account">
          <div className="flex flex-col gap-2">
            <h2 className='text-18 font-bold text-white'>{account?.data.name}</h2>
            <p className='text-14 text-blue-25'>{account?.data.name}</p>
            <p className='text-14 font-semibold tracking-[1.1px] text-white'>
                ●●●● ●●●● ●●●● <span className='text-16'>{account?.data.mask}</span>
            </p>
          </div>
        </div>
        <div className='transaction-account-balance'>
          <p className='text-14'>Current balance</p>
          <p className='text-24 text-center font-bold'>{formatAmount(account?.data.currentBalance)}</p>
        </div>
      </div>

      <section className='flex w-full flex-col gap-6'>
        <TransactionsTable transactions={currentTransactions} />
        {totalPages > 1 && <Pagination totalPages={totalPages} page={currentPage} />}
      </section>
    </section>
  )
}

export default Transaction