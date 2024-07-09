import React from 'react'
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Control, FieldPath } from 'react-hook-form'
import { z } from 'zod'
import { authFormSchema } from '@/lib/utils'

const formSchema = authFormSchema("sign-up")

interface CustomInput{
    control: Control<z.infer<typeof formSchema>>,
    name: FieldPath<z.infer<typeof formSchema>>,
    label: string,
    placeholder: string,
    type: string,
}

const CustomInput = ({control, name, label, placeholder, type="text"}:CustomInput) => {
  return (
    <FormField
        control={control}
        name={name}
        render={({ field }) => (
            <div className='form-item'>
                <FormLabel className='form-label' htmlFor={name}>
                    {label}
                </FormLabel>
                <div className="flex w-full flex-col">
                    <FormControl>
                        <Input id={name} placeholder={placeholder} className="input-class" type={type} {...field}/>
                    </FormControl>
                    <FormMessage className="form-message mt-2" />
                </div>
            </div>
        )}
    />
  )
}

export default CustomInput