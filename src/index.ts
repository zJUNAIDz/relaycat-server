import "dotenv/config";
import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { cors } from "hono/cors";
import s3Routes from "./routes/s3.route";
import ServersRoutes from "./routes/servers.route";

const app = new Hono();
const clientUrl = process.env.CLIENT_URL!;
if (!clientUrl) throw new Error("CLIENT_URL is not defined");

app.use(
  "*",
  cors({
    origin: clientUrl,
    credentials: true,
  })
);
app.use("/static/*", serveStatic({ root: "./" }));

app.route("/s3", s3Routes);
app.route("/servers", ServersRoutes);

app.get("/", (c) => {
  return c.html("<h1> This is an Internal API.</h1>");
});

export default {
  port: 3001,
  fetch: app.fetch,
};
