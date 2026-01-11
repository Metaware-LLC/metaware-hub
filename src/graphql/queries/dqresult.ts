import { gql } from "@apollo/client";

export const GET_DQ_DETAILS = gql`
  query DQDetails(
    $executionId: String
    $id: String
    $metaColumn: String
    $ruleId: String
    $status: String
  ) {
    dq_result(
      executionId: $executionId
      id: $id
      metaColumn: $metaColumn
      ruleId: $ruleId
      status: $status
    ) {
      id
      ruleName
      errorMessage
      executionId
      expectationType
      expectedValue
      library
      metaColumn
      observedValue
      predicateSql
      resultDetails
      rowsEvaluated
      rowsFailed
      rowsPassed
      ruleId
      ruleSubtype
      ruleType
      severity
      status
      execution {
        errorRules
        executionEnd
        executionMetadata
        executionStart
        failedRules
        id
        passedRules
        rulesetId
        status
        targetSnapshot
        targetTableFqn
        totalRules
        warningRules
        profiles(columnName: $metaColumn) {
          avgLength
          avgValue
          columnName
          dataType
          executionId
          histogram
          id
          maxDate
          maxLength
          maxValue
          median
          minDate
          minLength
          minValue
          nullCount
          nullPercentage
          patterns
          profilingMethod
          q1
          q3
          sampleSize
          sketches
          stdDev
          topValues
          totalRows
          uniquePercentage
          uniqueValues
        }
        ruleset {
          id
          name
          target_en_id
          type
          view_name
          rules {
            alias
            description
            id
            is_shared
            language
            meta_id
            name
            rule_expression
            rule_status
            subtype
            type
            meta {
              id
              length
              name
              type
            }
          }
        }
      }
    }
  }
`;

// TypeScript Interfaces
export interface DQMeta {
    id: string;
    length: number | null;
    name: string;
    type: string;
}

export interface DQRule {
    alias: string | null;
    description: string | null;
    id: string;
    is_shared: boolean | null;
    language: string;
    meta_id: string | null;
    name: string;
    rule_expression: string;
    rule_status: string;
    subtype: string;
    type: string;
    meta: DQMeta | null;
}

export interface DQRuleset {
    id: string;
    name: string;
    target_en_id: string;
    type: string;
    view_name: string | null;
    rules: DQRule[];
}

export interface DQProfile {
    avgLength: number | null;
    avgValue: number | null;
    columnName: string;
    dataType: string | null;
    executionId: string;
    histogram: string | null;
    id: string;
    maxDate: string | null;
    maxLength: number | null;
    maxValue: number | null;
    median: number | null;
    minDate: string | null;
    minLength: number | null;
    minValue: number | null;
    nullCount: number | null;
    nullPercentage: number | null;
    patterns: string | null;
    profilingMethod: string | null;
    q1: number | null;
    q3: number | null;
    sampleSize: number | null;
    sketches: string | null;
    stdDev: number | null;
    topValues: string | null;
    totalRows: number | null;
    uniquePercentage: number | null;
    uniqueValues: number | null;
}

export interface DQExecution {
    errorRules: number | null;
    executionEnd: string | null;
    executionMetadata: string | null;
    executionStart: string | null;
    failedRules: number | null;
    id: string;
    passedRules: number | null;
    rulesetId: string | null;
    status: string;
    targetSnapshot: string | null;
    targetTableFqn: string;
    totalRules: number | null;
    warningRules: number | null;
    profiles: DQProfile[];
    ruleset: DQRuleset | null;
}

export interface DQResult {
    id: string;
    ruleName: string;
    errorMessage: string | null;
    executionId: string;
    expectationType: string | null;
    expectedValue: string | null;
    library: string;
    metaColumn: string;
    observedValue: string | null;
    predicateSql: string | null;
    resultDetails: string | null;
    rowsEvaluated: number | null;
    rowsFailed: number | null;
    rowsPassed: number | null;
    ruleId: string;
    ruleSubtype: string;
    ruleType: string;
    severity: string;
    status: string;
    execution: DQExecution;
}

export interface DQDetailsResponse {
    dq_result: DQResult[];
}

export interface DQDetailsVariables {
    executionId?: string;
    id?: string;
    metaColumn?: string;
    ruleId?: string;
    status?: string;
}
