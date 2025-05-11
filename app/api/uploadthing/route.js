import { createNextRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "../../../uploadthing.config";

export const { GET, POST } = createNextRouteHandler({
  router: ourFileRouter,
});
