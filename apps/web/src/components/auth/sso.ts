/** Resource exposing Clerk's OAuth redirect helper (SignInResource or SignUpResource). */
interface OAuthRedirectResource {
    authenticateWithRedirect(opts: {
        strategy: 'oauth_google';
        redirectUrl: string;
        redirectUrlComplete: string;
    }): Promise<unknown>;
}

/**
 * Kick off the Google OAuth redirect flow. Works with both `signIn` and `signUp`
 * resources — Clerk reconciles new vs returning accounts on the callback.
 * On completion the user lands back on /sso-callback (see routes/sso-callback.tsx).
 */
export function startGoogleOAuth(resource: OAuthRedirectResource) {
    return resource.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/dashboard',
    });
}
