import { Hono } from "hono";
import { serversService } from "../services/servers.service";
import { parseToken } from "../utils/token";
import { newServerInputValidation } from "../utils/validation";
const serverRoutes = new Hono();

serverRoutes.post("/addNewServer", async (c) => {
  try {
    const body = await c.req.json();
    const validate = newServerInputValidation(body.name, body.imageUrl);
    if (!validate.success) {
      return c.json({ error: validate.error }, 400);
    }
    const { name, imageUrl } = validate.data;
    // Get profile
    const userToken = c.req.header("Authorization")?.replace("Bearer ", "");
    if (!userToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const profile = (await parseToken(userToken)) as {
      user: {
        id: string;
        name: string;
        email: string;
        imageUrl: string;
      };
    };
    // Create server
    const server = await serversService.createServer({
      profile: profile.user,
      serverName: name,
      serverImageUrl: imageUrl,
    });
    return c.json(server);
  } catch (err) {
    console.error("[SERVER_POST] ", err);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});
export default serverRoutes;
