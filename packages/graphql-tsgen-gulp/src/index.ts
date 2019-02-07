
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

      file.contents = new Buffer(
        printer.printList(
          ts.ListFormat.MultiLine,
          out,
          ts.createSourceFile(file.path, "", ts.ScriptTarget.Latest),
        )
      );

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
