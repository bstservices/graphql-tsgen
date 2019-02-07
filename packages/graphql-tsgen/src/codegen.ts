

import * as gqs from "graphql/type";
import * as gql from "graphql/language/ast";
import * as ts from "typescript";


interface Field {
  node: gql.FieldNode;
  schema: gqs.GraphQLField<any, any>;
  maySkip?: boolean;
  type: ts.TypeNode;
}


function genInterface(
  name: string,
  fields: Field[],
): ts.InterfaceDeclaration {
  return ts.createInterfaceDeclaration(
    undefined, // decorators
    [ts.createModifier(ts.SyntaxKind.ExportKeyword)],
    name,
    [], // type parameters
    [], // heritage clauses
    fields.map((field) => {
      const prop = ts.createPropertySignature(
        [ts.createModifier(ts.SyntaxKind.ReadonlyKeyword)],
        (field.node.alias || field.node.name).value,
        (field.maySkip ? ts.createToken(ts.SyntaxKind.QuestionToken) : undefined),
        field.type,
        undefined, // initializer
      );

      if (field.schema.description != null) {
        return ts.addSyntheticLeadingComment(
          prop,
          ts.SyntaxKind.MultiLineCommentTrivia,
          "* " + field.schema.description,
          true, // add trailing newline
        )
      } else {
        return prop;
      }
    }),
  );
}

function genSelectionSet(
  acc: ts.Statement[],
  set: gql.SelectionSetNode,
  name: string,
  schema: gqs.GraphQLSchema,
  baseType: gqs.GraphQLObjectType,
): void {
  const baseFields: Field[] = [];

  for (const sel of set.selections) {
    if (sel.kind !== "Field") continue;
    const schemaField = baseType.getFields()[sel.name.value];

    let fieldNullable = true;
    let arrayNullable = true;
    let isArray = false;
    let schemaType = schemaField.type;

    if (gqs.isNonNullType(schemaType)) {
      schemaType = schemaType.ofType;
      fieldNullable = false;
    }

    if (gqs.isListType(schemaType)) {
      schemaType = schemaType.ofType;
      isArray = true;

      if (gqs.isNonNullType(schemaType)) {
        schemaType = schemaType.ofType;
        arrayNullable = false;
      }
    }

    let type: ts.TypeNode;
    if (gqs.isScalarType(schemaType)) {
      switch (schemaType.name) {
        case "Int":
        case "Float":
          type = ts.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword);
          break;

        case "ID":
        case "String":
          type = ts.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
          break;

        case "Boolean":
          type = ts.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword);
          break;

        default:
          type = ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
          break;
      }

      type = ts.addSyntheticTrailingComment(
        type,
        ts.SyntaxKind.MultiLineCommentTrivia,
        schemaType.name,
      );
    } else if (gqs.isEnumType(schemaType)) {
      type = ts.addSyntheticLeadingComment(
        ts.createUnionTypeNode(
          schemaType.getValues().map((value) => (
            ts.createLiteralTypeNode(ts.createStringLiteral(value.name))
          ))
        ),
        ts.SyntaxKind.MultiLineCommentTrivia,
        schemaType.name,
      );
    } else if (gqs.isObjectType(schemaType)) {
      const subName = name + "$" + (sel.alias || sel.name).value;
      if (sel.selectionSet == null) {
        throw new Error(`object field '${subName}' missing selection set`);
      }

      genSelectionSet(acc, sel.selectionSet, subName, schema, schemaType);
      type = ts.createTypeReferenceNode(subName, []);
    } else {
      // TODO: other types are not supported yet
      continue;
    }

    if (isArray) {
      if (arrayNullable) {
        type = ts.createUnionTypeNode([
          type,
          ts.createKeywordTypeNode(ts.SyntaxKind.NullKeyword),
        ]);
      }

      type = ts.createArrayTypeNode(type);
    }

    if (fieldNullable) {
      type = ts.createUnionTypeNode([
        type,
        ts.createKeywordTypeNode(ts.SyntaxKind.NullKeyword),
      ]);
    }

    baseFields.push({
      node: sel,
      schema: schemaField,
      type: type,
    });
  }

  const iface = genInterface(name, baseFields);
  if (baseType.description != null) {
    acc.push(ts.addSyntheticLeadingComment(
      iface,
      ts.SyntaxKind.MultiLineCommentTrivia,
      "* " + baseType.description,
      true, // add trailing newline
    ));
  } else {
    acc.push(iface);
  }
}

function genOperation(
  acc: ts.Statement[],
  op: gql.OperationDefinitionNode,
  schema: gqs.GraphQLSchema,
): void {
  let baseType: gqs.GraphQLObjectType | null | undefined;
  if (op.operation === "query") {
    baseType = schema.getQueryType();
  } else if (op.operation === "mutation") {
    baseType = schema.getMutationType();
  } else if (op.operation === "subscription") {
    baseType = schema.getSubscriptionType();
  }

  if (baseType == null) {
    throw new Error("no schema defined for operation type " + op.operation);
  }

  if (op.name == null) {
    throw new Error("unnamed operations are not supported");
  }

  genSelectionSet(
    acc,
    op.selectionSet,
    op.name.value + "$Result",
    schema,
    baseType,
  );
}


export function transformFile(
  document: gql.DocumentNode,
  schema: gqs.GraphQLSchema,
): ts.NodeArray<ts.Statement> {
  const nodes: ts.Statement[] = [
    ts.addSyntheticLeadingComment(
      ts.addSyntheticLeadingComment(
        ts.createEmptyStatement(),
        ts.SyntaxKind.SingleLineCommentTrivia,
        " tslint:disable",
        true, // add trailing newline
      ),
      ts.SyntaxKind.SingleLineCommentTrivia,
      " THIS FILE IS GENERATED by graphql-tsgen",
      true, // add trailing newline
    ),
  ];

  for (const def of document.definitions) {
    switch (def.kind) {
      case "OperationDefinition":
        genOperation(nodes, def, schema);
        break;
    }
  }

  return ts.createNodeArray(nodes, true);
}
