import { Elysia } from "elysia";
import routes from "routes";
import { startScheduler, stopScheduler } from "./scheduler";

const app = new Elysia()
  // Serve static files from the public directory
  .use(routes);

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);

  // Start the scheduler for automated scraping and snapshots
  startScheduler();
});

// Graceful shutdown handling
process.on("SIGINT", () => {
  console.log("\nShutting down gracefully...");
  stopScheduler();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\nShutting down gracefully...");
  stopScheduler();
  process.exit(0);
});
