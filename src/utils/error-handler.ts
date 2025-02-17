import { Context } from "hono";

export const errorhandler = (err: Error, c: Context) => {
  console.error("[error handler]: ", err);
  return c.json(
    {
      error: err.message
      // process.env.NODE_ENV === "prod"
      //   ? "Server Error. run it in dev mode to see error message"
      //   : err.message,
    },
    err.name === "ValidationError" ? 400 : 500
  );
};
