import { staticPlugin } from "@elysiajs/static";
import { Elysia } from "elysia";
import routes from "routes";

const app = new Elysia()
  // Serve static files from the public directory
  .use(
    staticPlugin({
      assets: "public/gsp",
      alwaysStatic: true,
      indexHTML: true,
      prefix: "/gsp",
      noCache: true,
      directive: "no-cache",
      maxAge: 0,
    })
  )
  // Apply routes
  .use(routes);

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
