import { request } from "../lib/request";

type CreatePayload = { fullname: string; email: string}

type Ires = {success: boolean; errror?: string}

export const createAccount = async(payload: CreatePayload):Promise<Ires> => {
    return await request('v1/auth/register', 'POST', {
        name: payload.fullname,
        email: payload.email,
      });
}

export const verifyAccount = async(token: string):Promise<Ires> => {
    return await request('v1/auth/verify', 'POST', { token });
}