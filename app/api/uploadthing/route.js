import { createRouteHandler } from "uploadthing/next"; // ✅ DÜZELTİLDİ
import { ourFileRouter } from "@/uploadthing.config";

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
