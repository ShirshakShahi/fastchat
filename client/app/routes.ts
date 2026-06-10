import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/app", "./routes/app.tsx"),
  route("/space/:code", "./routes/ChatRoom.tsx"),
] satisfies RouteConfig;
