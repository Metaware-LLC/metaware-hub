/**
 * API Configuration
 * 
 * Centralized configuration for API endpoints and base URLs.
 * Uses environment variables for easy configuration across environments.
 */

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  GRAPHQL_ENDPOINT: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/graphql`,
  REST_ENDPOINT: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
} as const;