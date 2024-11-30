# gsp

This code has only been used on Linux or Mac. Should work on windows too but run it
from powershell or WSL.

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run src/server.ts
```

This project was created using `bun init` in bun v1.1.31. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

Before you run you need to prepare a database (sqlite) which is done by
```bash
bun run migrate
```

Sending data is done using the collect-data.js script in the coursedir-script folder. Currently
you need to configure server URL and course directory in code. Not possible to change via
command line params at the moment.