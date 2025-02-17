import { Hono } from "hono";
import { profileService } from "../services/profile.service";

const profilesRoute = new Hono()

profilesRoute.get("/:id", async (c) => {
  const id = c.req.param("id")
  if (!id) return c.json({ profile: null, error: "Id is required" }, 400)
  const profile = await profileService.getProfile(id)
  if (!profile) return c.json({ profile: null, error: "Profile not found" }, 404)
  return c.json({ profile, error: null })
})

export default profilesRoute