import {
  Mutation,
  Query,
  Subscription,
} from "graphql-tsgen-react-apollo";
import {
  MutationDocument,
  QueryDocument,
  SubscriptionDocument,
} from "graphql-tsgen-runtime";
import * as React from "react";


export interface TestData {
  foo: string;
}

export interface TestVariables {
  bar: string;
  baz: number;
}

export const testMutation: MutationDocument<TestData, TestVariables> = {
  kind: "Document",
  definitions: [],
};

export const testQuery: QueryDocument<TestData, TestVariables> = {
  kind: "Document",
  definitions: [],
};

export const testSubscription: SubscriptionDocument<TestData, TestVariables> = {
  kind: "Document",
  definitions: [],
};



// tests type of result data passed to render prop
export const TestMutationData1: React.FunctionComponent = () => (
  <Mutation mutation={testMutation}>
    {(mutate, result) => {
      if (result.data != null) {
        result.data; // $ExpectType TestData
        result.data.foo; // $ExpectType string
        // should error because bar is not defined
        result.data.bar; // $ExpectError
      }
      return "foo";
    }}
  </Mutation>
);

// tests type of result data returned from mutate function
export const TestMutationData2: React.FunctionComponent = () => (
  <Mutation mutation={testMutation}>
    {(mutate) => {
      mutate().then((result) => {
        if (result != null && result.data != null) {
          result.data; // $ExpectType TestData
          result.data.foo; // $ExpectType string
          // should error because bar is not defined
          result.data.bar; // $ExpectError
        }
      });
      return "foo";
    }}
  </Mutation>
);


// tests valid variables passed to mutate function
export const TestMutationVar1: React.FunctionComponent = () => (
  <Mutation mutation={testMutation}>
    {(mutate, result) => {
      mutate({variables: {bar: "ok", baz: 15}});
      return "foo";
    }}
  </Mutation>
);

// tests valid variables passed to props
export const TestMutationVar2: React.FunctionComponent = () => (
  <Mutation
      mutation={testMutation}
      variables={{bar: "ok", baz: 15}}
      >
    {(mutate, result) => "foo"}
  </Mutation>
);


// tests missing required variables passed to mutate function
export const TestMutationVarMissing1: React.FunctionComponent = () => (
  <Mutation mutation={testMutation}>
    {(mutate, result) => {
      // should error because bar is missing
      mutate({variables: {baz: 15}}); // $ExpectError
      return "foo";
    }}
  </Mutation>
);

// tests missing required variables passed to props
export const TestMutationVarMissing2: React.FunctionComponent = () => (
  <Mutation
      mutation={testMutation}
      // should error because baz is missing
      variables={{bar: "ok"}} // $ExpectError
      >
    {(mutate, result) => "foo"}
  </Mutation>
);


// tests extra variables passed to mutate function
export const TestMutateVarExtra1: React.FunctionComponent = () => (
  <Mutation mutation={testMutation}>
    {(mutate, result) => {
      // should error because extra is not defined
      mutate({variables: {bar: "ok", baz: 15, extra: "no"}}); // $ExpectError
      return "foo";
    }}
  </Mutation>
);

// tests extra variables passed to props
export const TestMutateVarExtra2: React.FunctionComponent = () => (
  <Mutation
      mutation={testMutation}
      // should error because extra is not defined
      variables={{bar: "ok", baz: 15, extra: "no"}} // TODO: $ExpectError
      >
    {(mutate, result) => "foo"}
  </Mutation>
);


// tests incorrect variable type passed to mutate function
export const TestMutateVarType1: React.FunctionComponent = () => (
  <Mutation mutation={testMutation}>
    {(mutate, result) => {
      // should error because baz is not boolean
      mutate({variables: {bar: "ok", baz: false}}); // $ExpectError
      return "foo";
    }}
  </Mutation>
);

// tests incorrect variable type passed to props
export const TestMutateVarType2: React.FunctionComponent = () => (
  <Mutation
      mutation={testMutation}
      // should error because baz is not boolean
      variables={{bar: "ok", baz: false}} // $ExpectError
      >
    {(mutate, result) => "foo"}
  </Mutation>
);



// tests type of result data passed to render prop
export const TestQueryData: React.FunctionComponent = () => (
  <Query query={testQuery}>
    {(result) => {
      if (result.data != null) {
        result.data; // $ExpectType TestData
        result.data.foo; // $ExpectType string
        // should error because bar is not defined
        result.data.bar; // $ExpectError
      }
      return "foo";
    }}
  </Query>
);

// tests valid variables passed to props
export const TestQueryVar: React.FunctionComponent = () => (
  <Query
      query={testQuery}
      variables={{bar: "ok", baz: 15}}
      >
    {(result) => "foo"}
  </Query>
);

// tests missing required variables passed to props
export const TestQueryVarMissing: React.FunctionComponent = () => (
  <Query
      query={testQuery}
      // should error because baz is missing
      variables={{bar: "ok"}} // $ExpectError
      >
    {(result) => "foo"}
  </Query>
);

// tests extra variables passed to props
export const TestQueryVarExtra: React.FunctionComponent = () => (
  <Query
      query={testQuery}
      // should error because extra is not defined
      variables={{bar: "ok", baz: 15, extra: "no"}} // TODO: $ExpectError
      >
    {(result) => "foo"}
  </Query>
);

// tests incorrect variable type passed to props
export const TestQueryVarType: React.FunctionComponent = () => (
  <Query
      query={testQuery}
      // should error because baz is not boolean
      variables={{bar: "ok", baz: false}} // $ExpectError
      >
    {(result) => "foo"}
  </Query>
);



// tests type of result data passed to render prop
export const TestSubscriptionData: React.FunctionComponent = () => (
  <Subscription subscription={testSubscription}>
    {(result) => {
      if (result.data != null) {
        result.data; // $ExpectType TestData
        result.data.foo; // $ExpectType string
        // should error because bar is not defined
        result.data.bar; // $ExpectError
      }
      return "foo";
    }}
  </Subscription>
);

// tests valid variables passed to props
export const TestSubscriptionVar: React.FunctionComponent = () => (
  <Subscription
      subscription={testSubscription}
      variables={{bar: "ok", baz: 15}}
      >
    {(result) => "foo"}
  </Subscription>
);

// tests missing required variables passed to props
export const TestSubscriptionVarMissing: React.FunctionComponent = () => (
  <Subscription
      subscription={testSubscription}
      // should error because baz is missing
      variables={{bar: "ok"}} // $ExpectError
      >
    {(result) => "foo"}
  </Subscription>
);

// tests extra variables passed to props
export const TestSubscriptionVarExtra: React.FunctionComponent = () => (
  <Subscription
      subscription={testSubscription}
      // should error because extra is not defined
      variables={{bar: "ok", baz: 15, extra: "no"}} // TODO: $ExpectError
      >
    {(result) => "foo"}
  </Subscription>
);

// tests incorrect variable type passed to props
export const TestSubscriptionVarType: React.FunctionComponent = () => (
  <Subscription
      subscription={testSubscription}
      // should error because baz is not boolean
      variables={{bar: "ok", baz: false}} // $ExpectError
      >
    {(result) => "foo"}
  </Subscription>
);



