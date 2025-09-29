/**
 * API Service for MetaWare Backend Integration
 * 
 * This service provides functions to interact with the MetaWare REST API
 * for managing namespaces, subject areas, entities, and metadata fields.
 */

const API_BASE_URL = 'http://localhost:8000';

/**
 * Generic API request helper
 */
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} - ${response.statusText}`);
  }

  return response.json();
}

/**
 * Namespace API Operations
 */
export const namespaceAPI = {
  create: async (namespaces: any[]) => {
    return apiRequest('/mwn/create_namespaces', {
      method: 'POST',
      body: JSON.stringify(namespaces),
    });
  },

  delete: async (ids: string[]) => {
    return apiRequest('/mwn/delete', {
      method: 'POST',
      body: JSON.stringify({
        object_type: 'namespace',
        ids,
      }),
    });
  },
};

/**
 * Subject Area API Operations
 */
export const subjectAreaAPI = {
  create: async (subjectAreas: any[]) => {
    return apiRequest('/mwn/create_subjectareas', {
      method: 'POST',
      body: JSON.stringify(subjectAreas),
    });
  },

  delete: async (ids: string[]) => {
    return apiRequest('/mwn/delete', {
      method: 'POST',
      body: JSON.stringify({
        object_type: 'subjectarea',
        ids,
      }),
    });
  },
};

/**
 * Entity API Operations
 */
export const entityAPI = {
  create: async (entities: any[]) => {
    return apiRequest('/mwn/create_entities', {
      method: 'POST',
      body: JSON.stringify(entities),
    });
  },

  createWithMeta: async (entityData: any, metaFields: any[]) => {
    return apiRequest('/mwn/create_entity', {
      method: 'POST',
      body: JSON.stringify({
        entity_request: entityData,
        meta_requests: metaFields,
      }),
    });
  },

  delete: async (ids: string[]) => {
    return apiRequest('/mwn/delete', {
      method: 'POST',
      body: JSON.stringify({
        object_type: 'entity',
        ids,
      }),
    });
  },
};

/**
 * Meta Field API Operations
 */
export const metaAPI = {
  delete: async (ids: string[]) => {
    return apiRequest('/mwn/delete', {
      method: 'POST',
      body: JSON.stringify({
        object_type: 'meta',
        ids,
      }),
    });
  },
};