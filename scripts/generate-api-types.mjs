import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import openapiTS, { astToString } from "openapi-typescript";
import prettier from "prettier";

const source =
  process.argv[2] ??
  process.env.OPENAPI_SCHEMA_URL ??
  "http://127.0.0.1:8000/openapi.json";
const schema = /^https?:\/\//.test(source)
  ? new URL(source)
  : pathToFileURL(resolve(source));
const output = resolve("src/shared/api/generated/schema.ts");

const ast = await openapiTS(schema);
const types = `// Сгенерировано из OpenAPI. Не редактировать вручную.\n${astToString(ast)}`;
const formatted = await prettier.format(types, { parser: "typescript" });

await mkdir(dirname(output), { recursive: true });
await writeFile(output, formatted);
console.info(`Типы OpenAPI обновлены: ${output}`);
