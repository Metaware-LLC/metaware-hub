/**
 * Apollo Client Configuration
 * 
 * This file sets up the Apollo Client for GraphQL communication with the backend.
 * The client is configured to connect to the local GraphQL server.
 * 
 * Features:
 * - InMemoryCache for efficient data caching
 * - Configurable URI for different environments
 * 
 * @author MetaWare Development Team
 * @version 1.0.0
 */

import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

/**
 * HTTP Link configuration for GraphQL endpoint
 * Points to localhost GraphQL server - update URI as needed for different environments
 */
const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql', // Update this to your GraphQL endpoint
  credentials: 'include', // Include cookies for authentication if needed
});

/**
 * Apollo Client instance with configured cache
 * 
 * Cache Configuration:
 * - InMemoryCache for optimal performance
 * - Normalized cache for efficient data storage and updates
 */
export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache({
    // Type policies can be added here for custom cache behavior
    typePolicies: {
      // Example: Custom merge functions for specific types
      Query: {
        fields: {
          // Configure field-specific cache policies if needed
        },
      },
    },
  }),
  // Default options for all queries
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});