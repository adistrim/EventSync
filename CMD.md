First SQL command in `Azure Data Studio`

```sql
CREATE DATABASE mydb;

USE mydb;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100)
);

INSERT INTO users (name, email) VALUES
('Alice', 'alice@example.com'),
('Bob', 'bob@example.com');
```

Migrating the database from mysql postgresql (`neon db`)

```bash
psql -h ep-shiny-union-a1c66ows.ap-southeast-1.aws.neon.tech -U mydb_owner -d mydb -f backup.sql
```

Installing Go MySQL Driver

```bash
go get -u github.com/go-sql-driver/mysql
```

Installing the godotenv package

```bash
go get github.com/joho/godotenv
```

Installing the pq package

```bash
go get github.com/lib/pq
```

Installing the Gorilla Mux, JWT, and Bcrypt packages

```bash
go get github.com/gorilla/mux
go get github.com/dgrijalva/jwt-go
go get golang.org/x/crypto/bcrypt
```

Installing the CORS package

```bash
go get -u github.com/rs/cors
```
