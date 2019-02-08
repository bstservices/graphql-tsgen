
export interface CodegenConfig
{
  /** How to output enum types from the GraphQL schema.
   * "union" (the default) emits a type alias of a union of string literals.
   * "enum" emits a TypeScript enum with string values.
   * "constEnum" is the same as "enum" but adds the `const` modifier,
   * and is therefore semantically equivalent to "union" at runtime
   * but syntactically equivalent to "enum".
   */
  enumAs?: "union" | "enum" | "constEnum";
}
