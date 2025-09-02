<!-- <p>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="logo/wordmark-dark.svg">
    <img src="logo/wordmark-light.svg" alt="test‑runner‑lite logo" width="440">
  </picture>
</p> -->
<p>
  <img src="logo/wordmark-light.svg" alt="test‑runner‑lite logo" width="440">
</p>

# test-runner-lite

Ultra‑small, dependency‑free test runner for Node.js modules.  
Minimal API, CLI‑friendly, and ideal for embedding in any module’s test suite.


## 📚 Table of Contents

- [✨ Features](#-features)
- [📦 Installation](#-installation)
- [🚀 Usage](#-usage)
- [🖥️ CLI Options](#️-cli-options)
- [📡 API](#-api)
- [🛠 CI/CD and integrations](#-cicd-and-integrations)
- [🧵 Cluster Mode and `--workers` Flag](#-cluster-mode-and---workers-flag)
- [📌 Snapshot usage](#-snapshot-usage)
- [🛠 Stability Tips](#-stability-tips)
- [📜 License](#-license)

---

## ✨ Features

- 📦 Single‑file, zero dependencies
- 🖥️ CLI support: `--json`, `--raw`, `--bail`, `--timeout`, `--testIDs`, `--workers`
- ✅ Works with sync, async, and Promise‑based tests
- 📊 Summary with per‑test timings
- 🎨 Color output (falls back gracefully if unsupported)
- 🌍 Cross‑platform: Windows, macOS, Linux
- ⚙️ `onComplete` callback for programmatic integration

<p align="right"><a href="#test-runner-lite">Back to top ↑</a></p>

---

## 📦 Installation

[Available on npm](https://www.npmjs.com/package/test-runner-lite)

From npm public registry:

```bash
npm install --save-dev test-runner-lite
```

<p align="right"><a href="#test-runner-lite">Back to top ↑</a></p>

---

## 🚀 Usage

Used to import a module:

```js
import testRunner from 'test-runner-lite';
// or
const testRunner = require('test-runner-lite');
```

Create a test file, e.g. index.test.js:

```js
const testRunner = require('test-runner-lite');

testRunner("My Module Tests", {}, (test) => {
  test("Example test", (check, done) => {
    check("sum", 1 + 1).mustBe(2).done();
  });

  test("Async test", async (check, done) => {
    const val = await Promise.resolve("nano");
    check("value", val).mustInclude("nano").done();
  });
});
```

Run:

```bash
node index.test.js
```

<p align="right"><a href="#test-runner-lite">Back to top ↑</a></p>

---

## 🖥️ CLI Options

| Option          | Description                                      |
|:----------------|:-------------------------------------------------|
| `--help`        | Show help                                        |
| `--testIDs=...` | Space‑separated list of test IDs to run          |
| `--timeout=ms`  | Timeout per test in milliseconds (default: 3000) |
| `--bail`        | Stop on first failure                            |
| `--json`        | Output machine‑readable JSON                     |
| `--raw`         | Disable ANSI colors and formatting               |
| `--silent`      | Suppress human output (for programmatic usage)   |
| `--workers`     | Run tests in both primary and worker processes   |

Example:

```bash
node index.test.js --json --bail --timeout=2000
node index.test.js --testIDs=1 3
```

<p align="right"><a href="#test-runner-lite">Back to top ↑</a></p>

---

## 📡 API

```js
testRunner(runnerName, [options], suiteFn)
```

 - **runnerName** `string` – Name shown in test output.
 - **options** `object` (optional) – Supports:
   - `timeout` (ms)
   - `bail`, `json`, `raw`, `silent`, `noExit`, `workers`
   - `testIDs` (array of string IDs)
   - `onComplete` (function receiving the full summary object)
 - **suiteFn** `function(testFn, isPrimary, isWorker)` – Receives the test() registrar.
   - `testFn` - The function that starts the test
   - `isPrimary` - True if the process is a primary
   - `isWorker` - True if the process is not a primary (it is the negation of `isPrimary`).

```js
testFn(name, [opts], fn)
```

 - **name** `string` – Test description
 - **opts**  `object` (optional) - Supports:
   - `timeout` (ms) – Override default for this test
   - `skip` `boolean` – Skip this test
   - `off` `boolean` – Skip this test and don't report it in the results
 - **fn** `function(check, done)` – Test body:
   - `check(label, value)` returns a chainable validator:
     - `.mustBe(val)`
     - `.mustNotBe(val)`
     - `.mustInclude(substr)`
     - `.truthy()`
     - `.falsy()`
     - `.done()`– end test
   - `done([error])` – Explicitly end test; passing a non‑empty error marks failure

<p align="right"><a href="#test-runner-lite">Back to top ↑</a></p>

---

## 🛠 CI/CD and integrations

`test-runner-lite` is designed so that its output is well suited for automation environments (GitHub Actions, GitLab CI, Jenkins, etc.) and for internal use in other CLI tools.

### JSON output for CI

Run the tests with the `--json` flag to get structured machine-readable output:

```bash
node test/index.test.js --json > test-report.json
```

Example of a JSON report:

```json
{
  "runner": "My Module Tests",
  "ok": true,
  "total": 3,
  "passed": 3,
  "failed": 0,
  "skipped": 0,
  "turned_off": 0,
  "time_ms": 12.34,
  "results": [
    { "id": 1, "name": "Example test", "status": "OK", "time_ms": 1.23 },
    { "id": 2, "name": "Async test", "status": "OK", "time_ms": 5.67 },
    { "id": 3, "name": "Another test", "status": "OK", "time_ms": 2.45 }
  ]
}
```

You can use this file:

 - CI in reporting
 - When starting ongoing workflows (e.g. when tests fail)
 - When generating reports

### Integration with CLIs and other modules

If you have your own CLI command (e.g. my-module test), you can bind test-runner-lite to it so that the CLI queries the results and formats them as needed.

Example inside the module:

 ```js
 const testRunner = require('test-runner-lite');

function runModuleTests(sendJson) {
  testRunner("My module Tests", {
    json: true,
    silent: true,
    noExit: true,
    onComplete: report => sendJson(report)
  }, (test) => {
    test("Module loads", (check, done) => {
      const mod = require('../index');
      check("type", typeof mod).mustBe("object").done();
    });

    // add your tests here...
  });
}

// In the CLI:
if (process.argv.includes('test')) {
  runModuleTests(report => {
    console.log(JSON.stringify(report, null, 2));
  });
}
 ```

This is how you can use the same engine:
 - Directly from the terminal (node ​​test/index.test.js)
 - Via CLI (my-module test)
 - In CI scripts (node ​​test/index.test.js --json)

<p align="right"><a href="#test-runner-lite">Back to top ↑</a></p>

 ---

## 📌 Snapshot usage

Install a specific version:

1. Install desired package version:

```bash
npm install test-runner-lite
```

2. Copy `node_modules/test-runner-lite/index.js` into your `test/testRunner.js` folder.

3. Change import:

```js
const testRunner = require('./testRunner');
```

<p align="right"><a href="#test-runner-lite">Back to top ↑</a></p>

---

## 🧵 Cluster Mode and `--workers` Flag

`test-runner-lite` can run tests in Node.js **cluster mode**. In this mode, the **Primary** process can fork one or more **Worker** processes, and each process will execute the same test file.

### How it works

 - **Primary process** parses CLI arguments and sets environment variables (`process.env`) for workers.
 - **Workers** inherit those environment variables when forked.
 - Both Primary and Workers run `test-runner-lite` independently.
 - You can use `isPrimary`/`isWorker` checks to control which tests run in which process.
 - Output can be prefixed (e.g., `pTEST` / `wTEST`) so you can tell which process produced which log line.
 - If you do not pass `--workers`, tests run only in the Primary process.

> ⚠️ Writing cluster‑aware tests requires a solid understanding of Node.js’s process model and the `cluster` module. Plan tests so that repeated execution in workers does not cause conflicts or side effects.

### Example: Cluster‑aware test file

```js
const testRunner = require('test-runner-lite');

testRunner("test-runner-lite sample tests", {
    workers: true,       // Enables worker processes to run tests as well
    timeout: 2000,       // default timeout
    json: process.argv.includes('--json'),
    raw: process.argv.includes('--raw'),
    silent: false,
    bail: false,
    noExit: false
}, (test, isPrimary, isWorker) => {

    // Primary-only test
    test("Primary Process: Loading module", { off: !isPrimary }, (check, done) => {
        const mod = require('./cluster'); // your module
        check("typeof", typeof mod).mustBe("object").done();
    });

    // Worker-only test
    test("Worker: process is worker", { off: !isWorker }, (check, done) => {
        check("isWorker", isWorker).mustBe(true).done();
    });

    // Runs in both
    test("Universal test", (check, done) => {
        check("platform", process.platform).mustInclude("linux").done();
    });

});
```

### Cluster Mode Flow – test-runner-lite

```text
┌───────────────────────┐
│    Primary process    │
│  (isPrimary = true)   │
└───────────┬───────────┘
            │ runs
            ▼
    ┌─────────────────┐
    │ testRunner(...) │
    └───────┬─────────┘
            │
            ├──► pTEST: "Primary Process: Loading module"
            │       (off if !isPrimary)
            │
            ├──► "Universal test"
            │       (runs in both)
            │
            └── cluster.fork()  ────┐
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   Worker process    │
                         │  (isWorker = true)  │
                         └──────────┬──────────┘
                                    │ runs
                                    ▼
                            ┌─────────────────┐
                            │ testRunner(...) │
                            └───────┬─────────┘
                                    │
                                    ├──► wTEST: "Worker: process is worker"
                                    │       (off if !isWorker)
                                    │
                                    └──► "Universal test"
                                            (runs in both)

```

#### Legend:
 - **pTEST** – Primary‑only test (`off: !isPrimary`)
 - **wTEST** – Worker‑only test (`off: !isWorker`)
 - **Universal test** – runs in both roles
 - `cluster.fork()` – spawns worker(s) that execute the same test file
 - `isPrimary` / `isWorker` – booleans passed into your test suite callback so you can branch logic

### Running the example

```bash
# Primary only
node cluster.test.js

# Primary + Worker
node cluster.test.js --workers

# With JSON output
node cluster.test.js --workers --json

# With custom timeout
node cluster.test.js --workers --timeout 5000
```

<p align="right"><a href="#test-runner-lite">Back to top ↑</a></p>

---

## 🛠 Stability Tips

 - **Included as a file**: If you want testRunner to not change with dependency updates, copy index.js to test/testRunner.js in your project.
 - **Version lock**: In public npm, set the exact version under devDependency, e.g.:

 ```json
"devDependencies": {
  "test-runner-lite": "1.0.0"
}
 ```
 - **Standard structure**: Keep all tests in the test/ folder and give them .test.js extensions — this will make CI setup easier.

<p align="right"><a href="#test-runner-lite">Back to top ↑</a></p>

 ---

## 📜 License

This project is licensed under the MIT License.

Copyright &copy; Manuel Lõhmus

<p align="right"><a href="#test-runner-lite">Back to top ↑</a></p>

---
