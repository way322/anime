// src/server/db/relations.ts
import { relations } from "drizzle-orm";
import {
  users,
  anime,
  studios,
  genres,
  ratings,
  favorites,
  animeGenres,
  animeImages,
  userAnimeStatus,
} from "./schema";

// USERS
export const userRelations = relations(users, ({ many }) => ({
  ratings: many(ratings),
  favorites: many(favorites),
  statuses: many(userAnimeStatus),
}));

// STUDIOS
export const studioRelations = relations(studios, ({ many }) => ({
  anime: many(anime),
}));

// ANIME
export const animeRelations = relations(anime, ({ many, one }) => ({
  studio: one(studios, {
    fields: [anime.studioId],
    references: [studios.id],
  }),
  ratings: many(ratings),
  genres: many(animeGenres),
  images: many(animeImages),
  favorites: many(favorites),
  userStatuses: many(userAnimeStatus),
}));

// GENRES
export const genreRelations = relations(genres, ({ many }) => ({
  anime: many(animeGenres),
}));

// ✅ USER_ANIME_STATUS
export const userAnimeStatusRelations = relations(userAnimeStatus, ({ one }) => ({
  user: one(users, {
    fields: [userAnimeStatus.userId],
    references: [users.id],
  }),
  anime: one(anime, {
    fields: [userAnimeStatus.animeId],
    references: [anime.id],
  }),
}));
