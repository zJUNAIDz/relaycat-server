import "dotenv/config";
import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { cors } from "hono/cors";
import { jwt, JwtVariables } from "hono/jwt";
import s3Routes from "./routes/s3.route";
import ServersRoutes from "./routes/servers.route";
import { getEnv } from "./utils/env";

type Variables = JwtVariables;
const app = new Hono<{ Variables: Variables }>();

const clientUrl = getEnv("CLIENT_URL");
app.use(
  "*",
  cors({
    origin: clientUrl,
    credentials: true,
  })
);
app.use(jwt({ secret: getEnv("JWT_SECRET") }));
app.use("/static/*", serveStatic({ root: "./" }));

app.route("/s3", s3Routes);
app.route("/servers", ServersRoutes);

app.get("/", (c) => {
  return c.html(`<h1> This is an Internal API.</h1>`);
});

export default {
  port: 3001,
  fetch: app.fetch,
};
