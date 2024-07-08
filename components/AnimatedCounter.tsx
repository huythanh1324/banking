"use client"
import React from 'react'
import CountUp from 'react-countup'

const AnimatedCounter = ({amount}:{amount:number}) => {
  return (
    <div>
      <CountUp 
      end = {amount} 
      prefix='$' 
      decimals={2}
      decimal=','
      duration={1}
      />
    </div>
  )
}

export default AnimatedCounter