import type { Connect, Plugin } from 'vite'
import type { IncomingMessage } from 'node:http'
import { ServerResponse } from 'node:http'
import httpProxy from 'http-proxy'
import {
  AUTH_COOKIE_NAME,
  buildAuthCookie,
  buildClearAuthCookie,
  extractTokenFromBody,
  getAuthTokenFromRequest,
  isLoginFailureBody,
  sendJson,
  stripTokenFromBody,
  userFromToken,
} from '../server/auth-cookie'

const LOGIN_PATH = '/sdg/uz/login'
const SESSION_PATH = '/__auth/session'
const LOGOUT_PATH = '/__auth/logout'

function isApiPath(url: string): boolean {
  return url.startsWith('/api') || url.startsWith('/sdg')
}

async function proxyLogin(
  req: IncomingMessage,
  res: ServerResponse,
  apiTarget: string,
  secureCookie: boolean,
): Promise<void> {
  const requestUrl = new URL(req.url ?? LOGIN_PATH, 'http://localhost')
  const backendUrl = `${apiTarget}${LOGIN_PATH}${requestUrl.search}`

  const response = await fetch(backendUrl, {
    method: 'POST',
    headers: {
      'ngrok-skip-browser-warning': 'true',
      'Content-Type': 'application/json',
    },
  })

  const raw = await response.text()
  let data: unknown = null
  try {
    data = raw ? JSON.parse(raw) : null
  } catch {
    sendJson(res, response.status, { message: 'Invalid login response' })
    return
  }

  const token = extractTokenFromBody(data)
  const loginFailed = isLoginFailureBody(data)

  if (response.ok && token && !loginFailed) {
    res.setHeader('Set-Cookie', buildAuthCookie(token, secureCookie))
  }

  res.statusCode = loginFailed && response.ok ? 401 : response.status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(stripTokenFromBody(data)))
}

function handleSession(req: IncomingMessage, res: ServerResponse): void {
  const token = getAuthTokenFromRequest(req)
  if (!token) {
    sendJson(res, 200, { authenticated: false })
    return
  }

  const user = userFromToken(token)
  sendJson(res, 200, {
    authenticated: true,
    user: user ?? undefined,
  })
}

function handleLogout(res: ServerResponse, secureCookie: boolean): void {
  res.setHeader('Set-Cookie', buildClearAuthCookie(secureCookie))
  sendJson(res, 200, { success: true })
}

function attachAuthProxy(
  middlewares: Connect.Server,
  apiTarget: string,
  secureCookie: boolean,
): void {
  const proxy = httpProxy.createProxyServer({
    target: apiTarget,
    changeOrigin: true,
    secure: false,
    headers: {
      'ngrok-skip-browser-warning': 'true',
    },
  })

  proxy.on('error', (_error, _req, res) => {
    if (res instanceof ServerResponse && !res.headersSent) {
      sendJson(res, 502, { message: 'Upstream API unavailable' })
    }
  })

  middlewares.use((req, res, next) => {
    const url = req.url ?? ''

    if (url === LOGOUT_PATH && req.method === 'POST') {
      handleLogout(res, secureCookie)
      return
    }

    if (url === SESSION_PATH && req.method === 'GET') {
      handleSession(req, res)
      return
    }

    if (url.startsWith(LOGIN_PATH) && req.method === 'POST') {
      void proxyLogin(req, res, apiTarget, secureCookie)
      return
    }

    if (!isApiPath(url)) {
      next()
      return
    }

    const token = getAuthTokenFromRequest(req)
    if (token) {
      req.headers.authorization = `Bearer ${token}`
    }

    proxy.web(req, res, { target: apiTarget })
  })
}

export function authCookieProxyPlugin(apiTarget: string): Plugin {
  const secureCookie = process.env.NODE_ENV === 'production'

  return {
    name: 'auth-cookie-proxy',
    configureServer(server) {
      attachAuthProxy(server.middlewares, apiTarget, secureCookie)
    },
    configurePreviewServer(server) {
      attachAuthProxy(server.middlewares, apiTarget, secureCookie)
    },
  }
}
