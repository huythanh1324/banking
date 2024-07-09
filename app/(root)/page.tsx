import HeaderBox from '@/components/HeaderBox'
import TotalBalanceBox from '@/components/TotalBalanceBox'
import { getLoggedInUser } from '@/lib/actions/user.action'
import React from 'react'

const HomePage = async() => {
  const loggedIn = await getLoggedInUser()
  return (
    <section className="home">
      <div className='home-content'>
        <header className="home-header">
          <HeaderBox 
            type="greeting" 
            title="Welcome" 
            subtext="Access & manage your account and transaction efficiently." 
            user ={loggedIn?.name || "Guest"}
          />

          <TotalBalanceBox accounts={[]} totalBanks={1} totalCurrentBalance={1250.27}/>
        </header>
      </div>
      <p>
        Recent transaction:
      </p>

    </section>
  )
}

export default HomePage


