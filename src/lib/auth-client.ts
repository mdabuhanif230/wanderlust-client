import { jwtClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

// No baseURL on purpose: on the client only NEXT_PUBLIC_* vars exist, and the
// auth route handler lives on this same origin (/api/auth).
export const authClient = createAuthClient({
    plugins: [
        jwtClient()
    ],
})