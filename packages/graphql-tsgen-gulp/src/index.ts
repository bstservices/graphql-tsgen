
import * as PluginError from "plugin-error";
import {Transform} from "stream";
import * as File from "vinyl";
import * as path from "path";
import * as fs from "fs";
import {
  Source,
  GraphQLSchema,
  buildSchema,
  buildClientSchema,
  parse as parseGraphql,
} from "graphql";
import * as ts from "typescript";

import {
 transformFile,
} from "graphql-tsgen";

const PLUGIN = "graphql-tsgen-gulp";

export class GraphqlTypescriptCodegen
extends Transform
{
  private readonly schema: GraphQLSchema;

  constructor(schemaFile: string) {
    super({objectMode: true});

    const ext = path.extname(schemaFile);
    if (ext === ".graphql") {
      this.schema = buildSchema(new Source(
        fs.readFileSync(schemaFile, "utf8"),
        schemaFile
      ));
    } else if (ext === ".json") {
      this.schema = buildClientSchema(
        JSON.parse(fs.readFileSync(schemaFile, "utf8"))
      );
    } else {
      throw new PluginError(PLUGIN, "unsupported schema extension " + ext);
    }
  }

  _transform(
    file: File,
    encoding: string,
    done: (err?: Error, file?: File) => void
  ) {
    if (file.isBuffer()) {
      const doc = parseGraphql(new Source(
        file.contents.toString(),
        file.path
      ));

      const out = transformFile(doc, this.schema);

      const printer = ts.createPrinter({
        newLine: ts.NewLineKind.LineFeed,
      });

      const sourceFile = ts.createSourceFile(
        file.path,
        "", // content
        ts.ScriptTarget.Latest
      );

      let body = "// tslint:disable\n";
      body += `// generated from ${file.basename} by graphql-tsgen-gulp\n`;

      for (const stmt of out) {
        body += "\n\n";
        body += printer.printNode(ts.EmitHint.Unspecified, stmt, sourceFile);
      }

      file.contents = Buffer.from(body, "utf-8");
      return done(undefined, file);
    } else if (file.isStream()) {
      return done(new PluginError(PLUGIN, "streams are not supported"));
    } else {
      // nothing to do
      return done(undefined, file);
    }
  }
}

export default GraphqlTypescriptCodegen;
