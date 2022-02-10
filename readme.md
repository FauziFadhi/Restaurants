# How to Run
1. run `cp .env.example .env`
2. fill `.env` file attributes
3. run `docker-compose -f docker-compose.yml up -d`
4. run `npm install`
5. run `npm run dev`
6. make a request to `http://localhost:8000/migrate/zloDtgPy0T` for migrating elastic map
7. run `npm run migrate -- up` to make migration for database


# Migrate Elastic Index Map
  http://localhost:8000/migrate/zloDtgPy0T

# Migrate Database
- make sure you have internet connection, because there are some retrieve data from internet.
- before you migrate your database make you already migrated elastic index map

run `npm run migrate -- up`

# Postman Collection
https://documenter.getpostman.com/view/4219273/UVeKoPdA