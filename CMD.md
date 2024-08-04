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

Installing Go MySQL Driver

```bash
go get -u github.com/go-sql-driver/mysql
```

Installing the godotenv package

```bash
go get github.com/joho/godotenv
```
