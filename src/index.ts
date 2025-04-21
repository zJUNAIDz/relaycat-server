import "dotenv/config";
import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { cors } from "hono/cors";
import { jwt, JwtVariables } from "hono/jwt";
import { socketManager } from "./lib/socket-manager";
import channelsRoute from "./routes/channels.route";
import conversationsRoute from "./routes/conversations.route";
import membersRoutes from "./routes/members.route";
import messagesRoute from "./routes/messages.route";
import profilesRoute from "./routes/profiles.route";
import s3Routes from "./routes/s3.route";
import serversRoutes from "./routes/servers.route";
import { getEnv } from "./utils/env";
import { errorhandler } from "./utils/error-handler";
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
app.route("profiles", profilesRoute)
app.route("/servers", serversRoutes);
app.route("/members", membersRoutes);
app.route("/channels", channelsRoute);
app.route("/conversations", conversationsRoute);
app.route("/messages", messagesRoute);
app.get("/", (c) => {
  return c.html(`<h1> This is an Internal API.</h1>`);
});
app.onError(errorhandler);
export default {
  port: 3001,
  fetch: app.fetch,
  server: socketManager.io
};
