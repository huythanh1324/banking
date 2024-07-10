import React, { useCallback, useEffect, useState } from 'react'
import { Button } from './ui/button'
import { useRouter } from 'next/navigation'
import { PlaidLinkOnSuccess, PlaidLinkOptions, usePlaidLink } from 'react-plaid-link'
import { createLinkToken } from '@/lib/actions/user.action'

const PlaidLink = ({user,variant}: PlaidLinkProps) => {
    const [token,setToken] = useState('');
    const router = useRouter()

    useEffect(()=>{
        const getLinkToken = async () =>{
            const data = await createLinkToken(user);

            setToken(data?.linkToken) 
        }
        getLinkToken();
    },[user])

    const onSuccess = useCallback<PlaidLinkOnSuccess>(async (pulbicToken: string) =>{
        // await exchangePublicToken({
        //     pulbicToken: public_token,
        //     user,
        // })

        router.push('/')
    },[user])
    const config : PlaidLinkOptions = {
        token,
        onSuccess
    }

    const  {open,ready} = usePlaidLink(config);

  return (
    <>
        {variant === 'primary' ? (
            <Button className='plaidlink-primary' onClick={()=>open()} disabled={!ready}>
                Connect Bank
            </Button>
        ) : variant === 'ghost' ? (
            <Button>
                Connect Bank
            </Button>
        ) : (
            <Button>
                Connect Bank
            </Button>
        )}   
    </>
  )
}

export default PlaidLink