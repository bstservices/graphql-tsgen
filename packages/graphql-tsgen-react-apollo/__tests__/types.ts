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

import * as path from "path";
import {
  Configuration,
  Formatters,
  Linter,
} from "tslint";

const linterConfig: Configuration.IConfigurationFile = {
  extends: [],
  rulesDirectory: [
    // `dtslint/bin/rules` doesn't have an `index.js`, so it won't resolve
    // if we pass it directly as the value of `rulesDirectory`
    // so we resolve a module we know exists instead and take its parent
    path.dirname(require.resolve("dtslint/bin/rules/expectRule")),
  ],
  jsRules: new Map(),
  rules: new Map([
    ["expect", {}],
  ]),
};

const linterProgram = Linter.createProgram(
  path.join(__dirname, "tsconfig.ex.json"),
  __dirname,
);

const linterFormatter = new Formatters.StylishFormatter();

expect.extend({
  toPassDTSLint(fileName: string) {
    const filePath = path.join(__dirname, fileName);
    const linter = new Linter({ fix: false }, linterProgram);
    linter.lint(filePath, "", linterConfig);
    const result = linter.getResult();
    if (result.errorCount > 0) {
      return {
        pass: false,
        message: () => linterFormatter.format(result.failures),
      };
    } else {
      return {
        pass: true,
        message: () => "DTSLint returned no errors",
      };
    }
  },
});

declare global {
  namespace jest {
    interface Matchers<R> {
      toPassDTSLint(): R;
    }
  }
}


test("inferred from typed Document in component props", () => {
  expect("componentProps.ex.tsx").toPassDTSLint();
});
