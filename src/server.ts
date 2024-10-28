import { Elysia } from "elysia";
import routes from "routes";

const app = new Elysia()
  // Serve static files from the public directory
  .use(routes);

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
