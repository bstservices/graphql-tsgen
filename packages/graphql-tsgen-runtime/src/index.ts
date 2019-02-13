/* Copyright 2019 BST Event Services, LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
