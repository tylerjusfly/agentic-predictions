/* eslint-disable @typescript-eslint/no-explicit-any */
import { getCookie } from "cookies-next/client";
import { API_ENDPOINT, COOKIE_KEY } from "./constants";

export type APIResponse<T = any> = {
  success: boolean;
  result: T;
  paging?: any;
};

export const checkStatus = async (response: any) => {
  if (!response.ok) {
    // if (response.statusText === 'Unauthorized') {
    //   // prettier-ignore
    //   // (new SSRStorage()).removeItem(TOKEN_COOKIE);
    //   window.location.reload();
    // }

    const message = await response.text();

    const err = JSON.parse(message);
    throw Object.freeze({ message: err.message || err.error });
  }

  return response;
};

export const defaultHeaders = {
  Accept: "application/json",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH",
  "Content-Type": "application/json",
};

export const parseJSON = (response: any) => response.json();

type methodType = "GET" | "POST" | "DELETE" | "PATCH";

export const request = async (url: string, method: methodType, data: any, auth?: boolean) => {
  const authToken = getCookie(COOKIE_KEY);

  const response = await fetch(`${API_ENDPOINT}/${url}`, {
    method: method,
    headers: auth ? { ...defaultHeaders, Authorization: `Bearer ${authToken}` } : { ...defaultHeaders },
    body: data ? JSON.stringify(data) : undefined,
  });
  const result = await checkStatus(response);
  return parseJSON(result);
};