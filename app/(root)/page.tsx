import HeaderBox from '@/components/HeaderBox'
import RecentTransactions from '@/components/home/RecentTransactions'
import RightSideBar from '@/components/home/RightSideBar'
import TotalBalanceBox from '@/components/my-banks/TotalBalanceBox'
import { getAccount, getAccounts } from '@/lib/actions/bank.action'
import { getLoggedInUser } from '@/lib/actions/user.actions'
import React from 'react'

const HomePage = async({searchParams: {id,page}}: SearchParamProps) => {
  const currentPage = Number(page as string) || 1
  const loggedIn = await getLoggedInUser()
  const accounts = await getAccounts({userId:loggedIn.$id})

  if (!accounts) return
  
  const accountsData = accounts.data
  const appwriteItemId = (id as string) || accountsData[0]?.appwriteItemId

  const account = await getAccount({appwriteItemId})

  return (
    <section className="home">
      <div className='home-content'>
        <header className="home-header">
          <HeaderBox 
            type="greeting" 
            title="Welcome" 
            subtext="Access & manage your account and transaction efficiently." 
            user ={loggedIn?.firstName || "Guest"}
          />

          <TotalBalanceBox 
            accounts={accountsData} 
            totalBanks={accounts?.totalBanks} 
            totalCurrentBalance={accounts?.totalCurrentBalance}
          />
        </header>
        <RecentTransactions accounts={accountsData} transactions={account?.transactions} appwriteItemId= {appwriteItemId} page={currentPage} />
      </div>
      <RightSideBar user={loggedIn} transactions={account?.transactions} banks={accountsData?.slice(0,2)}/>


    </section>
  )
}

export default HomePage


