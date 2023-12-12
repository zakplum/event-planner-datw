# EventPlanner

A Dynamic Web Application built for University

---

Modules needed:

- Node
- Express
- MySQL
- Express Session
- BCrypt
- Request

### Create the Database and Tables

```bash
mysql -u [mysql-username] -p eventplanner < database/setup.sql
```

_This will create the database and tables.
Register a new user and create an event through their webpages to insert into their respective tables_

---

## Features:

1. Register a new user
   - Password requiments necessary - labelled underneath input
   - Password Hashing for Security
2. Log in and Log out - Kept track by Express Session
3. Events
   - Create events
   - Search all events
   - Look up your own events
   - Delete those events
4. API Intergration
   - Under My Events use the search bar for weather data
   - ('/api') returns the events data as JSON
