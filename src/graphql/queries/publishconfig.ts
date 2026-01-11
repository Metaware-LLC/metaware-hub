import { gql } from "@apollo/client";

export const GET_GLOSSARY_PUBLISH_CONFIG = gql`
  query GetGlossaryPublishConfig(
    $targetNamespace: String!
    $targetSchema: String!
    $targetName: String!
  ) {
    glossary_publish_config(
      targetNamespace: $targetNamespace
      targetSchema: $targetSchema
      targetName: $targetName
    ) {
      id
      glossary_entity_fqn
      target_fqn
      status
      version
    }
  }
`;

export interface GlossaryPublishConfig {
    id: string;
    glossary_entity_fqn: string;
    target_fqn: string;
    status: string;
    version: number;
}
