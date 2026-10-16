import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ClassClash",
    short_name: "ClassClash",
    description: "Silent games for friends sitting across the classroom.",
    start_url: "/",
    display: "standalone",
    background_color: "#1e2b27",
    theme_color: "#1e2b27",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
