import { betterAuth } from "better-auth"
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "../../utils/enviroments"
 
export const auth = betterAuth({
    socialProviders: {
        google: { 
            prompt: "select_account", 
            clientId: GOOGLE_CLIENT_ID as string, 
            clientSecret: GOOGLE_CLIENT_SECRET as string, 
        }, 
    },
    trustedOrigins: ["http://localhost:3001"]
})