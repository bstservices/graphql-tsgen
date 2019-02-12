import {
  DocumentNode,
  FragmentDefinitionNode,
  OperationDefinitionNode,
} from "graphql";


export interface QueryDefinitionNode
extends OperationDefinitionNode
{
  operation: "query";
}

export interface QueryDocument<TData, TVariables>
extends DocumentNode
{
  definitions: ReadonlyArray<QueryDefinitionNode | FragmentDefinitionNode>;
}


export interface MutationDefinitionNode
extends OperationDefinitionNode
{
  operation: "mutation";
}

export interface MutationDocument<TData, TVariables>
extends DocumentNode
{
  definitions: ReadonlyArray<MutationDefinitionNode | FragmentDefinitionNode>;
}


export interface SubscriptionDefinitionNode
extends OperationDefinitionNode
{
  operation: "subscription";
}

export interface SubscriptionDocument<TData, TVariables>
extends DocumentNode
{
  definitions: ReadonlyArray<SubscriptionDefinitionNode | FragmentDefinitionNode>;
}
