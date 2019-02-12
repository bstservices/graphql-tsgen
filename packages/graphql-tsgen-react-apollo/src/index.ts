import {
  Component,
} from "react";

import {
  QueryDocument,
  MutationDocument,
  SubscriptionDocument,
} from "graphql-tsgen-runtime";

import {
  Query as RawQuery,
  QueryContext,
  QueryProps as RawQueryProps,

  Mutation as RawMutation,
  MutationContext,
  MutationProps as RawMutationProps,

  Subscription as RawSubscription,
  SubscriptionContext,
  SubscriptionProps as RawSubscriptionProps,
} from "react-apollo";

export * from "react-apollo";


export interface QueryProps<TData, TVariables>
extends RawQueryProps<TData, TVariables>
{
  query: QueryDocument<TData, TVariables>;
}

export const Query = RawQuery as {
  new <TData, TVariables>(
    props: QueryProps<TData, TVariables>,
    context: QueryContext,
  ): Component<QueryProps<TData, TVariables>>;
};


export interface MutationProps<TData, TVariables>
extends RawMutationProps<TData, TVariables>
{
  mutation: MutationDocument<TData, TVariables>;
}

export const Mutation = RawMutation as {
  new <TData, TVariables>(
    props: MutationProps<TData, TVariables>,
    context: MutationContext,
  ): Component<MutationProps<TData, TVariables>>;
};


export interface SubscriptionProps<TData, TVariables>
extends RawSubscriptionProps<TData, TVariables>
{
  subscription: SubscriptionDocument<TData, TVariables>;
}

export const Subscription = RawSubscription as {
  new <TData, TVariables>(
    props: SubscriptionProps<TData, TVariables>,
    context: SubscriptionContext,
  ): Component<SubscriptionProps<TData, TVariables>>;
};
