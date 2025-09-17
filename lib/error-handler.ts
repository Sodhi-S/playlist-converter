export class PlaylistConverterError extends Error {
  constructor(
    message: string,
    public code: string,
    public recoverable = true,
  ) {
    super(message)
    this.name = "PlaylistConverterError"
  }
}

export class AuthenticationError extends PlaylistConverterError {
  constructor(service: string) {
    super(`Authentication failed for ${service}. Please reconnect your account.`, "AUTH_ERROR", true)
  }
}

export class RateLimitError extends PlaylistConverterError {
  constructor(service: string, retryAfter?: number) {
    super(
      `Rate limit exceeded for ${service}. ${retryAfter ? `Please wait ${retryAfter} seconds before retrying.` : "Please try again later."}`,
      "RATE_LIMIT",
      true,
    )
  }
}

export class NetworkError extends PlaylistConverterError {
  constructor(message = "Network connection failed") {
    super(message, "NETWORK_ERROR", true)
  }
}

export class PlaylistNotFoundError extends PlaylistConverterError {
  constructor() {
    super("The selected playlist could not be found or is no longer accessible.", "PLAYLIST_NOT_FOUND", false)
  }
}

export class ServiceUnavailableError extends PlaylistConverterError {
  constructor(service: string) {
    super(`${service} service is currently unavailable. Please try again later.`, "SERVICE_UNAVAILABLE", true)
  }
}

export function handleApiError(error: any, service: string): PlaylistConverterError {
  if (error instanceof PlaylistConverterError) {
    return error
  }

  // Handle HTTP status codes
  if (error.status) {
    switch (error.status) {
      case 401:
        return new AuthenticationError(service)
      case 404:
        return new PlaylistNotFoundError()
      case 429:
        const retryAfter = error.headers?.["retry-after"]
        return new RateLimitError(service, retryAfter ? Number.parseInt(retryAfter) : undefined)
      case 503:
        return new ServiceUnavailableError(service)
      default:
        return new PlaylistConverterError(`${service} API error: ${error.message || "Unknown error"}`, "API_ERROR")
    }
  }

  // Handle network errors
  if (error.name === "TypeError" && error.message.includes("fetch")) {
    return new NetworkError()
  }

  // Generic error
  return new PlaylistConverterError(error.message || "An unexpected error occurred", "UNKNOWN_ERROR")
}

export function getErrorRecoveryActions(error: PlaylistConverterError): Array<{
  label: string
  action: string
  primary?: boolean
}> {
  const actions = []

  switch (error.code) {
    case "AUTH_ERROR":
      actions.push({ label: "Reconnect Account", action: "reconnect", primary: true })
      break
    case "RATE_LIMIT":
      actions.push({ label: "Wait and Retry", action: "retry", primary: true })
      break
    case "NETWORK_ERROR":
      actions.push({ label: "Check Connection", action: "check_network" })
      actions.push({ label: "Retry", action: "retry", primary: true })
      break
    case "SERVICE_UNAVAILABLE":
      actions.push({ label: "Try Again Later", action: "retry" })
      break
    default:
      if (error.recoverable) {
        actions.push({ label: "Try Again", action: "retry", primary: true })
      }
      break
  }

  actions.push({ label: "Report Issue", action: "report" })
  return actions
}
