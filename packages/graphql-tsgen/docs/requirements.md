## Goals

* Provide common infrastructure for parsing, validation, and transformation
  of GraphQL documents as part of the build process of client software.

* Enable language generators to produce typings for operation results and
  variables with a minimum of duplicated logic.

* Enable language generators to emit separate GraphQL ASTs (or documents, as
  appropriate) for each operation with a minimum of duplicated logic.

* (Mostly Later) Minify GraphQL operation ASTs to reduce size on the wire
  and parsing/validation time on the server.


## Metadata Generation Requirements

1. For each operation and fragment, generate a result AST which matches the 
   shape of the result as closely as possible without information available
   only at execution time such as variable values or object types. This assists
   language generators in producing result typings. Note that this result AST
   is produced in addition to, not in place of, a transformed GraphQL AST. 

   1. For each field, simplify selections to one selection set for the direct
      type, plus one selection set for each derived type if it's abstract.
      This may be achieved by partially executing the `CollectFields`
      algorithm from GraphQL &sect;6.3.2.

   2. Handle named fragment spreads. According to configuration, either:

      1. Merge named fragment spreads into the per-type selection sets as
         dictated by the `CollectFields` algorithm, or

      2. Provide a list of named fragment spreads for each selection set
         so that e.g. an intersection type can be generated.

   3. Annotate each node with its GraphQL type.

      1. Annotate fields with their actual result type,
         including all list and not-null wrapper types.

      2. Annotate selection sets with their named composite type,
         excluding any list and not-null wrapper types.

   4. Merge directive effects into the result AST.
      This allows for elimination of inline fragments used to hoist directives.
    
      1. Presence of `@skip` or `@include` mark the field as optional.
      
      2. Presence of `@deprecated` marks the field as deprecated.
         The deprecation reason should be included as a property of the node.

2. For each operation, produce a list of variables annotated with their
   GraphQL type. This is not necessary for fragments as it's not possible to
   invoke fragments on their own.

3. For each operation, produce a list of named fragments spread anywhere in
   that operation, including transitively within other fragments. This makes
   it easy to generate separate documents for each operation which contain
   only the necessary fragments (as required by the specification).

4. For each fragment and operation, and for the document as a whole, generate
   a list of GraphQL global types used. "global type" here means any GraphQL
   type not subject to field selection, i.e. scalars, enums, and input objects.
   This makes it easier for generators to emit typings or imports for only
   those global types used in an output file, rather than all global types
   defined in the schema.


## AST Transformation Requirements

1. Optionally inject the `__typename` introspection field into selection sets.
   According to configuration, do one of:
   
   1. Inject `__typename` into all selection sets. This is useful alongside
      client facilities like the Apollo Cache which need type metadata for
      every object in the response. These tools can generally perform this
      injection themselves, but doing it here ensures it's reflected in the
      generated result typings.
     
   2. Inject `__typename` only into selection sets for abstract types where
      the result type differs based on the concrete object type. This allows
      discrimination of the different result types at runtime with less impact
      on the result size than indiscriminately adding it to all selection sets.
   
   3. Do not inject `__typename`. This allows for maximum developer control.

2. Optionally make operations anonymous. Since language generators should emit
   separate GraphQL documents for each operation, including the operation name
   provides no benefit and increases the transmission size.
   When this feature is enabled:
   
   1. For all operations, remove the operation name.
   
   2. For query operations, use the query shorthand when possible.
