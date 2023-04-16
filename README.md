# Pitchfork Album Reviews

A backend project to fetch album reviews from various websites and expose endpoints via an API for further use. the motivation behind it is to use it a s a side project to keep practicing with Nestjs framework.

## Features

- Fetch album reviews from multiple sources
- Expose API endpoints for creating albums and fetching reviews
- Store fetched album reviews in a PostgreSQL database

## Requirements

- Node.js v16 or higher
- npm v9.5.0 or higher
- Docker and Docker Compose

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/albums-reviews.git
cd  reviews
```

2. Set .env file:

`DATABASE_URL="postgresql://admin:admin@postgres:5432/albums-reviews?schema=public"`

3. Run the command `make start`

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
