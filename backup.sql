-- PostgreSQL dump
--
-- Host: ep-shiny-union-a1c66ows.ap-southeast-1.aws.neon.tech    Database: mydb
-- ------------------------------------------------------
-- Server version: PostgreSQL 13

-- Drop existing tables
DROP TABLE IF EXISTS users;

-- Table structure for table `users`
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100)
);

-- Dumping data for table `users`
INSERT INTO users (id, name, email) VALUES
(1, 'Alice', 'alice@example.com'),
(2, 'Bob', 'bob@example.com');
