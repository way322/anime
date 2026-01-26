import Elysia from "elysia";
import { animeRouter } from "./anime";
import { genresRouter } from "./genres";

export const app = new Elysia({
  prefix: "/api",
})
.use(animeRouter)
.use(genresRouter);
