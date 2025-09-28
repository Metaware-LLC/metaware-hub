/**
 * GraphQL Queries for Meta (Field-level) Data Management
 * 
 * This file contains all GraphQL queries related to field-level metadata operations.
 * Meta represents individual field definitions within entities
 * in the MetaWare metadata management system.
 * 
 * Query Structure:
 * - GET_META_FOR_ENTITY: Retrieves field-level metadata for a specific entity
 * 
 * @author MetaWare Development Team
 * @version 1.0.0
 */

import { gql } from '@apollo/client';

/**
 * Query to fetch field-level metadata for a specific entity
 * 
 * This query retrieves meta information including:
 * - id: Unique identifier for the meta field
 * - alias: Alternative name for the field
 * - default: Default value for the field
 * - description: Detailed description of the field
 * - is_primary_grain: Boolean indicating if field is part of primary grain
 * - is_secondary_grain: Boolean indicating if field is part of secondary grain
 * - is_tertiary_grain: Boolean indicating if field is part of tertiary grain
 * - name: Field name
 * - nullable: Boolean indicating if field can be null
 * - order: Display order for the field
 * - subtype: Subtype classification of the field
 * - type: Data type of the field (VARCHAR, INTEGER, etc.)
 * 
 * Parameters:
 * - enid: Entity ID (required) - specifies which entity's fields to retrieve
 * - id: Filter by specific meta field ID (empty string returns all for entity)
 * 
 * Usage:
 * ```typescript
 * const { data, loading, error } = useQuery(GET_META_FOR_ENTITY, {
 *   variables: { enid: 'entity-id-here' }
 * });
 * ```
 */
export const GET_META_FOR_ENTITY = gql`
  query GET_META_FOR_ENTITY($enid: String!) {
    meta_meta(enid: $enid, id: "") {
      alias
      default
      description
      id
      is_primary_grain
      is_secondary_grain
      is_tertiary_grain
      name
      nullable
      order
      subtype
      type
    }
  }
`;

/**
 * TypeScript interfaces for type safety
 * These interfaces ensure proper typing for meta field data structures
 */

/**
 * Meta field data structure returned by GraphQL
 */
export interface MetaField {
  /** Unique identifier for the meta field */
  id: string;
  /** Alternative name for the field */
  alias?: string;
  /** Default value for the field */
  default?: string;
  /** Detailed description of the field */
  description?: string;
  /** Boolean indicating if field is part of primary grain */
  is_primary_grain: boolean;
  /** Boolean indicating if field is part of secondary grain */
  is_secondary_grain: boolean;
  /** Boolean indicating if field is part of tertiary grain */
  is_tertiary_grain: boolean;
  /** Field name */
  name: string;
  /** Boolean indicating if field can be null */
  nullable: boolean;
  /** Display order for the field */
  order?: number;
  /** Subtype classification of the field */
  subtype?: string;
  /** Data type of the field (VARCHAR, INTEGER, etc.) */
  type: string;
}

/**
 * GraphQL response structure for GET_META_FOR_ENTITY query
 */
export interface GetMetaForEntityResponse {
  meta_meta: MetaField[];
}

/**
 * Variables for GET_META_FOR_ENTITY query
 */
export interface GetMetaForEntityVariables {
  /** Entity ID (required) - specifies which entity's fields to retrieve */
  enid: string;
  /** Filter by specific meta field ID (optional) */
  id?: string;
}