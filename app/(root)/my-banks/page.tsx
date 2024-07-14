import BankCard from '@/components/BankCard'
import HeaderBox from '@/components/HeaderBox'
import { getAccounts } from '@/lib/actions/bank.action'
import { getLoggedInUser } from '@/lib/actions/user.actions'
import React from 'react'

const MyBank = async() => {
  const loggedIn = await getLoggedInUser()
  const accounts = await getAccounts({userId:loggedIn?.$id})

  return (
    <section className='my-banks'>
      <div className='banks'>
        <HeaderBox title="My Bank Accounts" subtext="Effortlessly manage your banking activities." />
      </div>

      <div className='space-y-4'>
        <h2 className='header-2'>Your cards</h2>
      </div>

      <div className='flex flex-wrap gap-6'>
        {accounts && accounts.data.map((a:Account)=>(
          <BankCard key={accounts.id} account={a} userName={loggedIn?.firstName} />
        ))}
      </div>
    </section>
  )
}

export default MyBank