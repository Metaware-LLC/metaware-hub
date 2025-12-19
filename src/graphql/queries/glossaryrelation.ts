/**
 * GraphQL Queries for Glossary Relations
 * 
 * This file contains queries and types related to glossary semantic relations.
 */

import { gql } from '@apollo/client';
import { Entity } from './entity';
import { MetaField } from './meta';

export const GET_GLOSSARY_RELATIONS = gql`
  query GET_GLOSSARY_RELATIONS($entityId: String!) {
    glossary_relation(drivingEntityId: $entityId) {
      id
      cardinality
      driving_entity {
        name
        subjectarea {
          name
          namespace {
            name
          }
          ns_id
        }
        description
        id
        metas {
          description
          id
          name
        }
        sa_id
      }
      related_entity {
        name
        subjectarea {
          name
          namespace {
            name
          }
        }
        description
      }
      drivingEntityId
      drivingGlossaryId
      driving_meta {
        description
        id
        name
      }
      relatedEntityId
      relatedGlossaryId
      related_meta {
        id
        name
        description
      }
      relationTypeCode
    }
  }
`;

export interface GlossaryRelation {
  id: string;
  cardinality?: string;
  driving_entity?: {
    name: string;
    subjectarea?: {
      name: string;
      namespace?: {
        name: string;
      };
      ns_id?: string;
    };
    description?: string;
    id: string;
    metas?: {
      description?: string;
      id: string;
      name: string;
    }[];
    sa_id?: string;
  };
  related_entity?: {
    name: string;
    subjectarea?: {
      name: string;
      namespace?: {
        name: string;
      };
    };
    description?: string;
  };
  drivingEntityId: string;
  drivingGlossaryId: string;
  driving_meta?: {
    description?: string;
    id: string;
    name: string;
  };
  relatedEntityId: string;
  relatedGlossaryId: string;
  related_meta?: {
    id: string;
    name: string;
    description?: string;
    alias?: string; // Kept for compatibility if used in UI, though query doesn't ask for it explicitily, but UI might expect it. 
    // Wait, user query DOES NOT include alias. I should remove it or make it optional. 
    // The UI uses alias. I'll check if I should add it to query or remove usage.
    // The user's query is specific. I should follow it. 
    // But if UI breaks, I should warn.
    // Accessing `alias` on `related_meta` in UI: `relation.related_meta?.alias`.
    // The user's query does NOT return alias.
    // I will add `alias` to the interface but optional, and maybe add it to the query if I can, OR just assume it's missing.
    // Actually, the user said "Use this extra information for glossary association graphql query."
    // It implies REPLACING or UPDATING. I will use exactly what they gave.
    // I will check if `alias` was critical in `GlossaryAssociations.tsx`.
  };
  relationTypeCode: string;
}

export interface GetGlossaryRelationsResponse {
  glossary_relation: GlossaryRelation[];
}

export interface GetGlossaryRelationsVariables {
  entityId: string;
}
