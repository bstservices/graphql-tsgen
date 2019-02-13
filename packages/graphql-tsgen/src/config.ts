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

  /** Whether generated ASTs for GraphQL operations should be printed on
   * multiple lines (true) or a single line (false, the default). The document
   * (outermost) node of an operation will always be printed on multiple lines
   * so that included fragments can be easily seen.
   */
  multilineOperationAST?: boolean;
}
