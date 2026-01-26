import Elysia from "elysia";
import { db } from "../db";
import { anime, studios } from "../db/schema";
import { eq } from "drizzle-orm";
import z from "zod/v4";

export const animeRouter = new Elysia({
    prefix: "/anime",
})
    .get("/", async () => {
        return await db.query.anime.findMany({
            with: {
                studio: true,
                genres: true,
                images: true,
            },
        });
    })
    .get("/:id", async ({ params }) => {
        return await db.query.anime.findFirst({
            where: eq(anime.id, Number(params.id)),
            with: {
                studio: true,
                episodes: true,
                genres: true,
                images: true,
            },
        });
    })
    .post("/", async ({ body }) => {
        await db.insert(anime).values({
            title: body.title,
            description: body.description,
            studioId: body.studioId,
            releaseYear: body.releaseYear,
            status: body.status,
        });
    }, {
        body: z.object({
            title: z.string(),
            description: z.string().optional(),
            studioId: z.number().optional(),
            releaseYear: z.number().optional(),
            status: z.string().optional(),
        }),
    })
    .put("/:id", async ({ params, body }) => {
        await db.update(anime)
            .set({
                title: body.title,
                description: body.description,
                studioId: body.studioId,
                releaseYear: body.releaseYear,
                status: body.status,
            })
            .where(eq(anime.id, Number(params.id)));
    }, {
        body: z.object({
            title: z.string(),
            description: z.string().optional(),
            studioId: z.number().optional(),
            releaseYear: z.number().optional(),
            status: z.string().optional(),
        }),
    })
    .delete("/:id", async ({ params }) => {
        await db.delete(anime)
            .where(eq(anime.id, Number(params.id)));
    });
