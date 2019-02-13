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
  Component,
} from "react";

import {
  MutationDocument,
  QueryDocument,
  SubscriptionDocument,
} from "graphql-tsgen-runtime";

import {
  Mutation as RawMutation,
  MutationContext,
  MutationProps as RawMutationProps,

  Query as RawQuery,
  QueryContext,
  QueryProps as RawQueryProps,

  Subscription as RawSubscription,
  SubscriptionContext,
  SubscriptionProps as RawSubscriptionProps,
} from "react-apollo";

export * from "react-apollo";


export interface MutationProps<TData, TVariables>
extends RawMutationProps<TData, TVariables>
{
  mutation: MutationDocument<TData, TVariables>;
}

export const Mutation = RawMutation as (
  new <TData, TVariables>(
    props: MutationProps<TData, TVariables>,
    context: MutationContext,
  ) => Component<MutationProps<TData, TVariables>>
);


export interface QueryProps<TData, TVariables>
extends RawQueryProps<TData, TVariables>
{
  query: QueryDocument<TData, TVariables>;
}

export const Query = RawQuery as (
  new <TData, TVariables>(
    props: QueryProps<TData, TVariables>,
    context: QueryContext,
  ) => Component<QueryProps<TData, TVariables>>
);


export interface SubscriptionProps<TData, TVariables>
extends RawSubscriptionProps<TData, TVariables>
{
  subscription: SubscriptionDocument<TData, TVariables>;
}

export const Subscription = RawSubscription as (
  new <TData, TVariables>(
    props: SubscriptionProps<TData, TVariables>,
    context: SubscriptionContext,
  ) => Component<SubscriptionProps<TData, TVariables>>
);
