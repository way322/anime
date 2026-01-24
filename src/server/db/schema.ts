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

//USERS
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

//STUDIOS
export const studios = pgTable("studios", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  country: varchar("country", { length: 50 }),
});

//GENRES  
export const genres = pgTable("genres", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
});

//ANIME
export const anime = pgTable("anime", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  studioId: integer("studio_id").references(() => studios.id),
  releaseYear: integer("release_year"),
  episodesCount: integer("episodes_count").default(0),
  status: varchar("status", { length: 20 }).default("ongoing"), // ongoing | completed
  rating: real("rating").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

//ANIME <-> GENRES
export const animeGenres = pgTable("anime_genres", {
  animeId: integer("anime_id")
    .references(() => anime.id)
    .notNull(),
  genreId: integer("genre_id")
    .references(() => genres.id)
    .notNull(),
});

//EPISODES
export const episodes = pgTable("episodes", {
  id: serial("id").primaryKey(),
  animeId: integer("anime_id")
    .references(() => anime.id)
    .notNull(),
  episodeNumber: integer("episode_number").notNull(),
  title: varchar("title", { length: 255 }),
  durationMinutes: integer("duration_minutes"),
  releaseDate: timestamp("release_date"),
});

//IMAGES
export const animeImages = pgTable("anime_images", {
  id: serial("id").primaryKey(),
  animeId: integer("anime_id")
    .references(() => anime.id)
    .notNull(),
  imageUrl: text("image_url").notNull(),
  isPoster: boolean("is_poster").default(false),
});

//RATING
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

//FAVORITES
export const favorites = pgTable("favorites", {
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  animeId: integer("anime_id")
    .references(() => anime.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});