// src/server/db/schema.ts
import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  real,
} from "drizzle-orm/pg-core";

// users (без изменений)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }),
  email: varchar("email", { length: 255 }).unique(),
  passwordHash: text("password_hash"),
  provider: varchar("provider", { length: 20 }).notNull().default("local"),
  providerId: varchar("provider_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// STUDIOS
export const studios = pgTable("studios", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  country: varchar("country", { length: 50 }),
});

// GENRES
export const genres = pgTable("genres", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
});

// ANIME — добавил external_url (iframe/link), удалил episodesCount
export const anime = pgTable("anime", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  studioId: integer("studio_id").references(() => studios.id),
  releaseYear: integer("release_year"),
  // episodesCount: integer("episodes_count").default(0), <-- удалено по вашей задаче
  status: varchar("status", { length: 20 }).default("ongoing"), // ongoing | completed
  rating: real("rating").default(0),
  externalUrl: text("external_url").notNull(), // <- ссылка на iframe / плеер (ваша новая модель)
  createdAt: timestamp("created_at").defaultNow(),
});

// ANIME <-> GENRES
export const animeGenres = pgTable("anime_genres", {
  animeId: integer("anime_id")
    .references(() => anime.id)
    .notNull(),
  genreId: integer("genre_id")
    .references(() => genres.id)
    .notNull(),
});

// IMAGES
export const animeImages = pgTable("anime_images", {
  id: serial("id").primaryKey(),
  animeId: integer("anime_id")
    .references(() => anime.id)
    .notNull(),
  imageUrl: text("image_url").notNull(),
  isPoster: boolean("is_poster").default(false),
});

// RATINGS (оставил, если захотите оценки)
export const ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  animeId: integer("anime_id")
    .references(() => anime.id)
    .notNull(),
  value: integer("value").notNull(),
});

// FAVORITES
export const favorites = pgTable("favorites", {
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  animeId: integer("anime_id")
    .references(() => anime.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
