

import * as gqs from "graphql/type";
import * as gql from "graphql/language/ast";
import * as ts from "typescript";


function addJSDoc<T extends ts.Node>(
  schema: {
    description?: string | null,
    isDeprecated?: boolean | null,
    deprecationReason?: string | null,
  },
  node: T,
): T {
  let doc = "";

  if (schema.description) {
    doc = schema.description;
  }

  if (schema.isDeprecated) {
    doc += "\n@deprecated";
    if (schema.deprecationReason) {
      doc += " " + schema.deprecationReason;
    }
  }

  if (doc) {
    // add gutter and trailing line for multiline comments
    if (doc.indexOf("\n") != -1) {
      doc = doc.replace(/\n/g, "\n * ") + "\n";
    }

    return ts.addSyntheticLeadingComment(
      node,
      ts.SyntaxKind.MultiLineCommentTrivia,
      "* " + doc + " ",
      true, // add trailing newline
    );
  } else {
    return node;
  }
}


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
    fields.map((field) => addJSDoc(field.schema, ts.createPropertySignature(
      [ts.createModifier(ts.SyntaxKind.ReadonlyKeyword)],
      (field.node.alias || field.node.name).value,
      (field.maySkip ? ts.createToken(ts.SyntaxKind.QuestionToken) : undefined),
      field.type,
      undefined, // initializer
    ))),
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

  acc.push(addJSDoc(baseType, genInterface(name, baseFields)));
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
  const nodes: ts.Statement[] = [];

  for (const def of document.definitions) {
    switch (def.kind) {
      case "OperationDefinition":
        genOperation(nodes, def, schema);
        break;
    }
  }

  return ts.createNodeArray(nodes, true);
}
