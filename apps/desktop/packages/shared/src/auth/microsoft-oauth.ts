/**
 * Microsoft OAuth flow using Azure AD OAuth 2.0 with PKCE
 *
 * This module handles the complete Microsoft OAuth flow for Microsoft 365 APIs:
 * 1. Opens browser for Microsoft consent screen
 * 2. Receives authorization code via local callback server
 * 3. Exchanges code for access and refresh tokens
 * 4. Returns tokens and user email
 *
 * Supports multiple Microsoft services (Outlook, OneDrive, Calendar, Teams)
 * with predefined scope sets, or custom scopes for other Microsoft Graph APIs.
 *
 * Uses "common" tenant endpoint to support both personal Microsoft accounts
 * and work/school (Azure AD) accounts.
 */

import { URL } from 'url';
import { randomBytes, createHash } from 'crypto';
import { openUrl } from '../utils/open-url.ts';
import { createCallbackServer, type AppType } from './callback-server.ts';
import { type MicrosoftService } from '../sources/types.ts';
import { type OAuthSessionContext, buildOAuthDeeplinkUrl } from './types.ts';
import type { PreparedOAuthFlow, OAuthExchangeParams, OAuthExchangeResult } from './oauth-flow-types.ts';

// Re-export MicrosoftService type for convenient access
export type { MicrosoftService };

// Microsoft OAuth configuration - must be set via environment variables
// These are baked into the build at compile time
// Used for all Microsoft services (Outlook, OneDrive, Calendar, Teams, etc.)
// Uses pure PKCE flow - no client_secret needed for public clients (desktop/mobile apps)
const MICROSOFT_CLIENT_ID = process.env.MICROSOFT_OAUTH_CLIENT_ID || '';

/**
 * Endpoints per tenant. Connectors keep "common" (personal + work accounts);
 * app sign-in (entra-signin.ts) passes the tenant GUID — B2B guests cannot sign in via "common".
 */
export function microsoftAuthUrlFor(tenant = 'common'): string {
  return `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize`;
}
export function microsoftTokenUrlFor(tenant = 'common'): string {
  return `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`;
}
const MICROSOFT_AUTH_URL = microsoftAuthUrlFor();
const MICROSOFT_TOKEN_URL = microsoftTokenUrlFor();
const MICROSOFT_GRAPH_ME_URL = 'https://graph.microsoft.com/v1.0/me';

/**
 * Token endpoint failure with the AADSTS codes parsed out, so callers can tell
 * "user not assigned to the app" (50105) from an expired refresh token.
 */
export class MicrosoftTokenError extends Error {
  readonly status: number;
  readonly error: string;
  readonly description: string;
  readonly aadCodes: string[];

  constructor(prefix: string, status: number, body: string) {
    super(`${prefix}: ${body}`);
    this.name = 'MicrosoftTokenError';
    this.status = status;
    let parsed: { error?: string; error_description?: string; error_codes?: unknown[] } = {};
    try {
      parsed = JSON.parse(body);
    } catch {
      // non-JSON body — keep raw text in description
    }
    this.error = String(parsed.error ?? '');
    this.description = String(parsed.error_description ?? body);
    const codes = new Set<string>();
    for (const code of parsed.error_codes ?? []) codes.add(String(code));
    for (const m of this.description.matchAll(/AADSTS(\d+)/g)) codes.add(m[1]!);
    this.aadCodes = [...codes];
  }
}

/** Per-call overrides for app sign-in; connectors leave these unset. */
interface TenantOptions {
  clientId?: string;
  tenant?: string;
}

/**
 * Predefined scope sets for common Microsoft services
 *
 * Microsoft Graph uses delegated permissions with format:
 * https://graph.microsoft.com/{permission}
 *
 * Common permissions:
 * - User.Read: Sign in and read user profile
 * - Mail.Read/ReadWrite/Send: Email access
 * - Calendars.Read/ReadWrite: Calendar access
 * - Files.Read/ReadWrite: OneDrive access
 * - Chat.Read/ReadWrite: Teams chat access
 * - offline_access: Required for refresh tokens
 */
export const MICROSOFT_SERVICE_SCOPES: Record<MicrosoftService, string[]> = {
  outlook: [
    'https://graph.microsoft.com/Mail.ReadWrite',
    'https://graph.microsoft.com/Mail.Send',
    'https://graph.microsoft.com/User.Read',
    'offline_access',
  ],
  'microsoft-calendar': [
    'https://graph.microsoft.com/Calendars.ReadWrite',
    'https://graph.microsoft.com/User.Read',
    'offline_access',
  ],
  onedrive: [
    'https://graph.microsoft.com/Files.ReadWrite',
    'https://graph.microsoft.com/User.Read',
    'offline_access',
  ],
  teams: [
    'https://graph.microsoft.com/Chat.ReadWrite',
    'https://graph.microsoft.com/ChannelMessage.Send',
    'https://graph.microsoft.com/User.Read',
    'offline_access',
  ],
  sharepoint: [
    'https://graph.microsoft.com/Sites.ReadWrite.All',
    'https://graph.microsoft.com/User.Read',
    'offline_access',
  ],
};

/**
 * Options for starting Microsoft OAuth flow
 */
export interface MicrosoftOAuthOptions {
  /** Microsoft service to authenticate (uses predefined scopes) */
  service?: MicrosoftService;
  /** Custom scopes (overrides service scopes if provided) */
  scopes?: string[];
  /** App type for callback server styling */
  appType?: AppType;
  /** Session context for building deeplink back to chat after OAuth */
  sessionContext?: OAuthSessionContext;
  /** App registration to use instead of the build-time connector client id (app sign-in) */
  clientId?: string;
  /** Tenant GUID instead of "common" (required for B2B guest sign-in) */
  tenant?: string;
  /** Authorize prompt. Connectors force 'consent' to guarantee a refresh token; sign-in uses 'select_account'. */
  prompt?: 'consent' | 'select_account' | 'login' | 'none';
  /** Pre-fills the home domain on the Microsoft sign-in page (e.g. lsinjectionusa.com) */
  domainHint?: string;
}

/**
 * Result of Microsoft OAuth flow
 */
export interface MicrosoftOAuthResult {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  email?: string;
  /** OIDC id_token — present when `openid` was requested (app sign-in reads identity from here) */
  idToken?: string;
  error?: string;
}

/**
 * Generate PKCE code verifier and challenge
 */
function generatePKCE(): { verifier: string; challenge: string } {
  const verifier = randomBytes(32).toString('base64url');
  const challenge = createHash('sha256').update(verifier).digest('base64url');
  return { verifier, challenge };
}

/**
 * Generate random state for CSRF protection
 */
function generateState(): string {
  return randomBytes(16).toString('hex');
}

/**
 * Exchange authorization code for tokens
 */
async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string,
  redirectUri: string,
  options: TenantOptions = {}
): Promise<{ accessToken: string; refreshToken?: string; expiresIn?: number; idToken?: string }> {
  const params = new URLSearchParams({
    client_id: options.clientId ?? MICROSOFT_CLIENT_ID,
    code,
    code_verifier: codeVerifier,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
  });

  const response = await fetch(microsoftTokenUrlFor(options.tenant), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new MicrosoftTokenError('Token exchange failed', response.status, errorText);
  }

  const data = (await response.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    id_token?: string;
  };

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    idToken: data.id_token,
  };
}

/**
 * Get user email from access token using Microsoft Graph API
 */
async function getUserEmail(accessToken: string): Promise<string> {
  const response = await fetch(MICROSOFT_GRAPH_ME_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error('Failed to get user info from Microsoft Graph');
  }

  const data = (await response.json()) as {
    mail?: string;
    userPrincipalName?: string;
  };

  // Microsoft Graph returns 'mail' for work accounts, 'userPrincipalName' as fallback
  // For personal accounts, userPrincipalName is typically the email
  return data.mail || data.userPrincipalName || 'unknown';
}

/**
 * Refresh Microsoft access token using refresh token
 */
export async function refreshMicrosoftToken(
  refreshToken: string,
  options: TenantOptions & {
    /**
     * Scopes for the new access token. A v2 refresh token covers every resource the
     * user consented to, so app sign-in can mint e.g. an Azure DevOps token here
     * without another browser round-trip.
     */
    scopes?: string[];
  } = {}
): Promise<{
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  idToken?: string;
}> {
  const params = new URLSearchParams({
    client_id: options.clientId ?? MICROSOFT_CLIENT_ID,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });
  if (options.scopes?.length) params.set('scope', options.scopes.join(' '));

  const response = await fetch(microsoftTokenUrlFor(options.tenant), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new MicrosoftTokenError('Failed to refresh Microsoft token', response.status, await response.text());
  }

  const data = (await response.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    id_token?: string;
  };

  return {
    accessToken: data.access_token,
    // Microsoft may return a new refresh token (rotation)
    refreshToken: data.refresh_token,
    expiresAt: data.expires_in ? Date.now() + data.expires_in * 1000 : undefined,
    idToken: data.id_token,
  };
}

/**
 * Check if Microsoft OAuth is configured (client ID is set)
 * Note: Client secret is optional for public clients using PKCE
 */
export function isMicrosoftOAuthConfigured(): boolean {
  return Boolean(MICROSOFT_CLIENT_ID);
}

/**
 * Get scopes for a Microsoft service or use custom scopes
 */
export function getMicrosoftScopes(options: MicrosoftOAuthOptions): string[] {
  // Custom scopes take precedence
  if (options.scopes && options.scopes.length > 0) {
    // Ensure required scopes are included
    const requiredScopes = ['https://graph.microsoft.com/User.Read', 'offline_access'];
    const allScopes = [...options.scopes];
    for (const scope of requiredScopes) {
      if (!allScopes.includes(scope)) {
        allScopes.push(scope);
      }
    }
    return allScopes;
  }

  // Use predefined service scopes
  if (options.service && options.service in MICROSOFT_SERVICE_SCOPES) {
    return MICROSOFT_SERVICE_SCOPES[options.service];
  }

  // Default to Outlook scopes for backwards compatibility
  return MICROSOFT_SERVICE_SCOPES.outlook;
}

/**
 * Options for preparing a Microsoft OAuth flow (server-side, no browser interaction)
 */
export interface PrepareMicrosoftOAuthOptions {
  service?: MicrosoftService;
  scopes?: string[];
  /** Port for the local callback server (Electron). One of callbackPort or callbackUrl required. */
  callbackPort?: number;
  /** Full callback URL (WebUI). Takes precedence over callbackPort. */
  callbackUrl?: string;
}

/**
 * Prepare a Microsoft OAuth flow without starting a callback server or opening a browser.
 * Returns everything needed to construct the auth URL and later exchange the code.
 */
export function prepareMicrosoftOAuth(options: PrepareMicrosoftOAuthOptions): PreparedOAuthFlow {
  if (!isMicrosoftOAuthConfigured()) {
    throw new Error(
      'Microsoft OAuth not configured. Set MICROSOFT_OAUTH_CLIENT_ID environment variable.'
    );
  }

  const scopes = getMicrosoftScopes(options);
  const pkce = generatePKCE();
  const state = generateState();
  const redirectUri = options.callbackUrl
    ?? `http://localhost:${options.callbackPort}/callback`;

  const authUrl = new URL(MICROSOFT_AUTH_URL);
  authUrl.searchParams.set('client_id', MICROSOFT_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', scopes.join(' '));
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('code_challenge', pkce.challenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');
  authUrl.searchParams.set('response_mode', 'query');
  authUrl.searchParams.set('prompt', 'consent');

  return {
    authUrl: authUrl.toString(),
    state,
    codeVerifier: pkce.verifier,
    tokenEndpoint: MICROSOFT_TOKEN_URL,
    clientId: MICROSOFT_CLIENT_ID,
    redirectUri,
    provider: 'microsoft',
  };
}

/**
 * Exchange a Microsoft authorization code for tokens (server-side).
 * Also fetches the user's email/UPN via Microsoft Graph.
 */
export async function exchangeMicrosoftOAuth(params: OAuthExchangeParams): Promise<OAuthExchangeResult> {
  try {
    const tokens = await exchangeCodeForTokens(params.code, params.codeVerifier, params.redirectUri);

    const email = await getUserEmail(tokens.accessToken);

    return {
      success: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresIn ? Date.now() + tokens.expiresIn * 1000 : undefined,
      email,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Microsoft OAuth exchange failed',
    };
  }
}

/**
 * Start Microsoft OAuth flow
 *
 * Opens browser for Microsoft consent, handles callback, and returns tokens + email.
 * Supports multiple Microsoft services via the service option, or custom scopes.
 *
 * @example
 * // Authenticate for Outlook
 * const result = await startMicrosoftOAuth({ service: 'outlook' });
 *
 * @example
 * // Authenticate for OneDrive
 * const result = await startMicrosoftOAuth({ service: 'onedrive' });
 *
 * @example
 * // Authenticate with custom scopes
 * const result = await startMicrosoftOAuth({
 *   scopes: ['https://graph.microsoft.com/Tasks.ReadWrite']
 * });
 */
export async function startMicrosoftOAuth(
  options: MicrosoftOAuthOptions = {}
): Promise<MicrosoftOAuthResult> {
  try {
    // Verify OAuth credentials are configured (app sign-in supplies its own client id)
    const clientId = options.clientId ?? MICROSOFT_CLIENT_ID;
    if (!clientId) {
      return {
        success: false,
        error:
          'Microsoft OAuth not configured. Set MICROSOFT_OAUTH_CLIENT_ID environment variable.',
      };
    }

    // Get scopes for this request
    const scopes = getMicrosoftScopes(options);

    // Generate PKCE and state
    const pkce = generatePKCE();
    const state = generateState();

    // Start callback server with deeplink for returning to chat session
    const appType = options.appType || 'electron';
    const deeplinkUrl = buildOAuthDeeplinkUrl(options.sessionContext);
    const callbackServer = await createCallbackServer({ appType, deeplinkUrl });
    const redirectUri = `${callbackServer.url}/callback`;

    // Build authorization URL
    const authUrl = new URL(microsoftAuthUrlFor(options.tenant));
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', scopes.join(' '));
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('code_challenge', pkce.challenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');
    // Response mode 'query' returns code in URL query params (default for authorization_code)
    authUrl.searchParams.set('response_mode', 'query');
    // Connectors force 'consent' so a refresh token is always issued; app sign-in (admin-consented) uses 'select_account'
    authUrl.searchParams.set('prompt', options.prompt ?? 'consent');
    if (options.domainHint) authUrl.searchParams.set('domain_hint', options.domainHint);

    // Open browser for authorization
    await openUrl(authUrl.toString());

    // Wait for callback
    const callback = await callbackServer.promise;

    // Verify state
    if (callback.query.state !== state) {
      return {
        success: false,
        error: 'OAuth state mismatch - possible CSRF attack',
      };
    }

    // Check for error
    if (callback.query.error) {
      return {
        success: false,
        error: callback.query.error_description || callback.query.error,
      };
    }

    // Get authorization code
    const code = callback.query.code;
    if (!code) {
      return {
        success: false,
        error: 'No authorization code received',
      };
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code, pkce.verifier, redirectUri, { clientId, tenant: options.tenant });

    // Get user email — with an id_token in hand a Graph hiccup must not fail the sign-in
    let email = '';
    try {
      email = await getUserEmail(tokens.accessToken);
    } catch (err) {
      if (!tokens.idToken) throw err;
    }

    return {
      success: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresIn ? Date.now() + tokens.expiresIn * 1000 : undefined,
      email,
      idToken: tokens.idToken,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during Microsoft OAuth',
    };
  }
}
