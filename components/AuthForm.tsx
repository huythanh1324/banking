"use client"

import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Divide, Loader2 } from 'lucide-react'
import { time } from 'console'
import CustomInput from './CustomInput'
import { authFormSchema } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { signIn, signUp } from '@/lib/actions/user.actions'
import PlaidLink from './PlaidLink'




const AuthForm = ({type}: {type: string}) => {
    const router = useRouter()
    const [user, setUser] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    const formSchema = authFormSchema(type)

      // 1. Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
        email: "",
        password: ''
        },
    })
 
    // 2. Define a submit handler.
    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        setIsLoading(true)
        try{
            // Sign up with Appwrite & create plaid token
            if (type==='sign-up'){
                const userData = {
                    firstName: data.firstName!,
                    lastName: data.lastName!,
                    address1: data.address1!,
                    city: data.city!,
                    postalCode: data.postalCode!,
                    dob: data.dob!,
                    ssn: data.ssn!,
                    email: data.email,
                    password: data.password
                }

                const newUser = await signUp(userData)
                setUser(newUser)
            }

            if (type==='sign-in'){
                const response= await signIn({
                    email : data.email,
                    password : data.password
                })

                if (response) router.push('/')
            }

        }catch(err){

        } finally {  
            console.log(data)
            setIsLoading(false)
        }
    }
  return (
    <section className='auth-form'>
        <header className='flex flex-col gap-5 md:gap-8'>
            <Link href='/' className='mb-12 cursor-pointer flex items-center gap-2'>
                <Image src="icons/logo.svg" width={34} height={34} alt="logo" className='size-[24px] max-xl:size-14'/>
                <h1 className='text-26 font-ibm-plex-serif font-bold text-black-1'>Banking</h1>
            </Link>
            <div className="flex flex-col gap-1 md:gap-3">
                <h1 className='text-24 lg:text-26 font-semibold text-gray-900'>
                    {user ? 
                            "Link Account" :
                            type === "sign-in" ?
                            "Sign In" :
                            "Sign Up"}
                    
                    <p className="text-16 font-normal text-gray-600">
                        {user ? 
                            "Link your account to get started" : 
                            "Please enter your details"}
                    </p>
                </h1>
            </div>
        </header>
        {user ? (
            <div className='flex flex-col gap-4'>
                <PlaidLink user={user} variant="primary"/>
            </div>
        ) : (
            <>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {type ==='sign-up' ? (
                        <>
                        <div className='flex gap-4'>
                            <CustomInput control={form.control} name="firstName" label='First Name' placeholder='Enter your first name' type="text"/>
                            <CustomInput control={form.control} name="lastName" label='Last Name' placeholder='Enter your last name' type="text"/>
                        </div>
                        <CustomInput control={form.control} name="address1" label='Address' placeholder='Enter your address' type="text"/>
                        <div className='flex gap-4'>    
                            <CustomInput control={form.control} name="city" label='City' placeholder='Ex:HCM ' type="text"/>
                            <CustomInput control={form.control} name="postalCode" label='Postal Code' placeholder='Ex: 70000' type="text"/>
                        </div>

                        <div className='flex gap-4'>
                            <CustomInput control={form.control} name="dob" label='Data of Birth' placeholder='dd-mm-yyyy' type="text"/>
                            <CustomInput control={form.control} name="ssn" label='SSN' placeholder='Ex:4321' type="text"/>
                        </div>
                        </>
                    ):(<></>)}
                    <CustomInput control={form.control} name="email" label='Email' placeholder='Enter your email' type="text"/>
                    <CustomInput control={form.control} name="password" label='Password' placeholder='Enter your password' type='password'/>
                    
                    <div className='flex flex-col gap-4'>
                        <Button type="submit" className='form-btn' disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className='animate-spin'/> &nbsp;Loading...
                                </>
                            ): type === 'sign-in' ? "Sign In" : "Sign Up"}
                        </Button>
                    </div>
                </form>
                </Form>
                
                <footer className='flex justify-center gap-1'>
                    <p className='text-14 font-normal text-gray-600'>
                        {type=== 'sign-in' ? "Don't have an account?" : "Already have an account?"}
                    </p>
                    <Link href={type === 'sign-in' ? '/sign-up' : '/sign-in'} className='form-link'>
                    { type === 'sign-in' ? 'Sign Up' : 'Sign In' }
                    </Link>
                </footer>
            </>
        )}
    </section>
  )
}

export default AuthForm