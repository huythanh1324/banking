"use server"

import { ID, Query } from "node-appwrite"
import { createAdminClient, createSessionClient } from "../appwrite"
import { cookies } from "next/headers"
import { encryptId, extractCustomerIdFromUrl, parseStringify } from "../utils"
import { CountryCode, ProcessorTokenCreateRequestProcessorEnum, Products } from "plaid"
import { plaidClient } from "../plaid"
import { ProcessorTokenCreateRequest } from 'plaid'
import { revalidatePath } from "next/cache"
import { addFundingSource, createDwollaCustomer } from "./dwolla.actions"
import { QUARTER_PI } from "chart.js/helpers"

const {
    APPWRITE_DATABASE_ID : DATABASE_ID,
    APPWRITE_USER_COLLECTION_ID: USER_COLLECTION_ID,
    APPWRITE_BANK_COLLECTION_ID: BANK_COLLECTION_ID
} = process.env;

export const getUserInfo = async ({userId} : getUserInfoProps) =>{
    try{

        const { database } =  await createAdminClient();
        
        const user = await database.listDocuments(
            DATABASE_ID!,
            USER_COLLECTION_ID!,
            [Query.equal('userId',[userId])]
        )
        
        return parseStringify(user.documents[0])
    } catch(err){
        console.log("Error when getting user info",err)
    }
}

export const signIn = async ({email, password}: signInProps) => {
    try{
        const { account } = await createAdminClient();

        const session = await account.createEmailPasswordSession(email, password);

        cookies().set("appwrite-session", session.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        }); 

        const user = await getUserInfo({userId: session.userId})

        return parseStringify(user);
    } catch(err){
        console.log("Error:",err)
    }
}

export const signUp = async ({password,...userData} : SignUpParams) => {
    const {email, firstName, lastName} = userData

    let newUserAccount

    try{
        const { account, database } = await createAdminClient();

        newUserAccount = await account.create(
            ID.unique(), 
            email, 
            password, 
            `${firstName} ${lastName}`
        )

        if(!newUserAccount) throw new Error("Error when creating new user")

        const dwollaCustomerUrl = await createDwollaCustomer({
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            address1: userData.address1,
            city: userData.city,
            postalCode: userData.postalCode,
            dateOfBirth: userData.dob,
            state: userData.city,
            ssn: userData.ssn,
            type: 'personal'
        })

        if(!dwollaCustomerUrl) throw new Error("Error creating Dwolla customer")

        const dwollaCustomerId = extractCustomerIdFromUrl(dwollaCustomerUrl)

        const newUser = await database.createDocument(
            DATABASE_ID!,
            USER_COLLECTION_ID!,
            ID.unique(),
            {
                ...userData,
                userId: newUserAccount.$id,
                dwollaCustomerId,
                dwollaCustomerUrl
            }
        )
        
        const session = await account.createEmailPasswordSession(email, password);

        cookies().set("appwrite-session", session.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        }); 

        return parseStringify(newUser)
    } catch(err){
        console.log("Error:",err)
    }
}

// ... your initilization functions

export async function getLoggedInUser() {
    try {
      const { account } = await createSessionClient();
      const result = await account.get();

      const user = await getUserInfo({userId : result.$id})    
      
      return parseStringify(user)
    } catch (err) {
      console.log(err)  
      return null;
    }
  }
  
export const  logoutAccount = async()=>{
    try{
        const { account } = await createSessionClient();
        
        cookies().delete('appwrite-session');

        await account.deleteSession('current')
    } catch(err){
        return null
    }
}

export const createLinkToken = async (user: User) =>{
    try{
        const tokenParams = {
            user: {
                client_user_id: user.$id
            },
            client_name: `${user.firstName} ${user.lastName}`,
            products: ['auth'] as Products[],
            language: 'en',
            country_codes: ["US"] as CountryCode[]
        }
        const response = await plaidClient.linkTokenCreate(tokenParams) 

        return parseStringify({linkToken:response.data.link_token})
    }catch(err){
        console.log(err)
    }
}

export const createBankAccount = async({
    userId,
    bankId,
    accountId,
    accessToken,
    fundingSourceUrl,
    sharableId
}:createBankAccountProps) => {
    try{
        const {database} = await createAdminClient();

        console.log(BANK_COLLECTION_ID)

        const bankAccount = await database.createDocument(
            DATABASE_ID!,
            BANK_COLLECTION_ID!,
            ID.unique(),
            {
                userId,
                bankId,
                accountId,
                accessToken,
                fundingSourceUrl,
                sharableId
            }
        )
        return parseStringify(bankAccount)
    } catch(err){
        console.log(err)
    }
}

export const exchangePublicToken = async ({publicToken, user} : exchangePublicTokenProps) => {
    try{
        const response = await plaidClient.itemPublicTokenExchange({public_token:publicToken})

        const accessToken = response.data.access_token
        const itemId = response.data.item_id

        const accountsResponse = await plaidClient.accountsGet({access_token: accessToken})

        const accountData = accountsResponse.data.accounts[0]

        const request : ProcessorTokenCreateRequest = {
            access_token: accessToken,
            account_id: accountData.account_id,
            processor: "dwolla" as ProcessorTokenCreateRequestProcessorEnum,
        }

        const processorTokenResponse = await plaidClient.processorTokenCreate(request)
        const processorToken = processorTokenResponse.data.processor_token

        const fundingSourceUrl = await addFundingSource({
            dwollaCustomerId : user.dwollaCustomerId,
            processorToken,
            bankName: accountData.name
        })

        if (!fundingSourceUrl) throw Error

        await createBankAccount ({
            userId: user.$id,
            bankId: itemId,
            accountId: accountData.account_id,
            accessToken,
            fundingSourceUrl,
            sharableId: encryptId(accountData.account_id)
        })

        revalidatePath('/')

        return parseStringify({publicTokenExchange: "complete"})
    }catch(err){
        console.log(err)
    }
}

export const getBanks = async({userId}: getBanksProps) =>{
    try{
        const { database } =  await createAdminClient();
        const banks = await database.listDocuments(
            DATABASE_ID!,
            BANK_COLLECTION_ID!,
            [Query.equal("userId",[userId])]
        )

        return parseStringify(banks.documents)
    } catch (err){
        console.log("Error when getting all bank accounts",err)
    }
}
export const getBank = async({documentId}: getBankProps) =>{
    try{
        const { database } =  await createAdminClient();

        const bank = await database.listDocuments(
            DATABASE_ID!,
            BANK_COLLECTION_ID!,
            [Query.equal('$id',[documentId])]
        )
        return parseStringify(bank.documents[0])
    } catch (err){
        console.log("Error when getting a bank account",err)
    }
}

export const getBankByAccountId = async({accountId}: getBankByAccountIdProps) =>{
    try{
        const { database } =  await createAdminClient();

        const bank = await database.listDocuments(
            DATABASE_ID!,
            BANK_COLLECTION_ID!,
            [Query.equal('accountId',[accountId])]
        )
        console.log(bank)
        if (bank.total !== 1 ) return null

        return parseStringify(bank.documents[0])
    } catch (err){
        console.log("Error when getting a bank account",err)
    }
}

