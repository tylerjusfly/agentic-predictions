import { request } from "../lib/request";

type CreatePayload = { fullname: string; email: string}
type LoginPayload = { passkey: string; email: string}

export type IUser = {
  id: string
  email: string
  accessToken: string
  verified: number,
  subscribed: number,
  subsribed_at: null |string,
  created_at: string
}

type Ires = {success: boolean; errror?: string; user?: IUser}

export const createAccount = async(payload: CreatePayload):Promise<Ires> => {
    return await request('v1/auth/register', 'POST', {
        name: payload.fullname,
        email: payload.email,
      });
}

export const accessAccount = async(payload: LoginPayload):Promise<Ires> => {
    return await request('api/users/login', 'POST', {
        password: payload.passkey,
        email: payload.email,
      });
}

export const verifyAccount = async(token: string):Promise<Ires> => {
    return await request('v1/auth/verify', 'POST', { token });
}