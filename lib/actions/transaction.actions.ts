"use server"

import { ID, Query } from "node-appwrite"
import { createAdminClient } from "../appwrite"
import { parseStringify } from "../utils"

const {
    APPWRITE_DATABASE_ID:DATABASE_ID,
    APPWRITE_USER_COLLECTION_ID:USER_COLLECTION_ID, 
    APPWRITE_BANK_COLLECTION_ID:BANK_COLLECTION_ID, 
    APPWRITE_TRANSACTION_COLLECTION_ID:TRANSACTION_COLLECTION_ID 
} = process.env

export const createTransaction = async( transaction: CreateTransactionProps) =>{
    try{
        const {database} = await createAdminClient()
        console.log('start create document')

        const newTransaction = await database.createDocument(
            DATABASE_ID!,
            TRANSACTION_COLLECTION_ID!,
            ID.unique(),
            {
                channel: 'online',
                category: 'Transfer',
                ...transaction
            }
        )
        console.log(newTransaction)
        return parseStringify(newTransaction)
    }catch(err){
        console.log(err)
    }
}

export const getTransactionsByBankId = async( {bankId}: getTransactionsByBankIdProps) =>{
    try{
        const {database} = await createAdminClient()

        const senderTransaction = await database.listDocuments(
            DATABASE_ID!,
            TRANSACTION_COLLECTION_ID!,
            [Query.equal("senderBankId",bankId)]
        )

        const receiverTransaction = await database.listDocuments(
            DATABASE_ID!,
            TRANSACTION_COLLECTION_ID!,
            [Query.equal("receiverBankId",bankId)]
        )

        const transaction ={
            total: senderTransaction.total + receiverTransaction.total,
            documents: [...senderTransaction.documents,...receiverTransaction.documents]
        }
        return parseStringify(transaction)
    }catch(err){
        console.log(err)
    }
}

