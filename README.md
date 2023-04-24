# Pitchfork Album Reviews

This backend project retrieves album review scores and links from various websites and provides API endpoints for further use. Its purpose is personal use, allowing me to practice with the Nest.js framework.

Currently, it only fetches reviews from https://pitchfork.com. I use it in conjunction with this Chrome extension to insert scores into playlists: https://github.com/egimenos/spotify-playlist-reviews-extension. This way, I can easily see an album's score for a song and quickly access the review page.

## Features

- Fetch album reviews from multiple sources
- Expose API endpoints for creating albums and fetching reviews
- Store fetched album reviews in a PostgreSQL database

## Requirements

- Node.js v16 or higher
- npm v9.5.0 or higher
- Docker and Docker Compose

## Installation

Clone the repository:

```bash
git clone https://github.com/yourusername/albums-reviews.git
cd  reviews
```

Set .env file:

`DATABASE_URL="postgresql://admin:admin@postgres:5432/albums-reviews?schema=public"`

Build the image:

```sh
make build
```

## Usage

### To start the app along with the database and pgadmin

```sh
make start
```

### See the logs

```sh
make app-logs
```

### Run migrations and access Prisma studio

Inside the `nestjs-api` service container, run `npm run migrate`
To launch Prisma Studio, inside the same bash session in the app service: `npm run prisma:studio`

### Access pgAdmin

Go to `http://ocalhost:8080` and acess using the credentials of the database.

## Deployment

The project is prepared and contains a `fly.toml` to be deployed to `https://fly.io/`

## API Endpoints

This project exposes the following API endpoints:

### Create Album

- Method: `POST`
- URL: `/albums`
- Body: `CreateAlbumDto`

Creates a new album with the provided information in the `CreateAlbumDto`.

### Find Album by Name

- Method: `GET`
- URL: `/albums/:name`

Finds an album by its name. Returns the album details if found, otherwise returns `null`.

### Fetch Reviews

- Method: `POST`
- URL: `/albums/fetch_reviews`
- Body: `first_fetching` (optional)

Fetches album reviews from external sources. If `first_fetching` is set to `true`, it will fetch all available reviews; otherwise, it will only fetch the latest reviews.

## Scheduled tasks

We use the task scheduling features from Nest to run a crobjob each day to fetch last reviews: https://docs.nestjs.com/techniques/task-scheduling
