import { relations } from "drizzle-orm";
import {
  users,
  anime,
  studios,
  genres,
  episodes,
  ratings,
  favorites,
  animeGenres,
  animeImages,
} from "./schema";

//USERS
export const userRelations = relations(users, ({ many }) => ({
  ratings: many(ratings),
  favorites: many(favorites),
}));

//STUDIOS
export const studioRelations = relations(studios, ({ many }) => ({
  anime: many(anime),
}));

//ANIME
export const animeRelations = relations(anime, ({ many, one }) => ({
  studio: one(studios, {
    fields: [anime.studioId],
    references: [studios.id],
  }),
  episodes: many(episodes),
  ratings: many(ratings),
  genres: many(animeGenres),
  images: many(animeImages),
  favorites: many(favorites),
}));

//GENRES
export const genreRelations = relations(genres, ({ many }) => ({
  anime: many(animeGenres),
}));