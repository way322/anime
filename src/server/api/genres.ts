import Elysia from "elysia";
import { db } from "../db";
import { genres } from "../db/schema";
import { eq } from "drizzle-orm";
import z from "zod/v4";

export const genresRouter = new Elysia({
    prefix: "/genres",
})
    .get("/", async () => {
        return await db.query.genres.findMany();
    })
    .get("/:id", async ({ params }) => {
        return await db.query.genres.findFirst({
            where: eq(genres.id, Number(params.id)),
        });
    })
    .post("/", async ({ body }) => {
        await db.insert(genres).values({
            name: body.name,
        });
    }, {
        body: z.object({
            name: z.string(),
        }),
    })
    .put("/:id", async ({ params, body }) => {
        await db.update(genres)
            .set({ name: body.name })
            .where(eq(genres.id, Number(params.id)));
    }, {
        body: z.object({
            name: z.string(),
        }),
    })
    .delete("/:id", async ({ params }) => {
        await db.delete(genres)
            .where(eq(genres.id, Number(params.id)));
    });
