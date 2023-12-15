CREATE DATABASE IF NOT EXISTS eventplanner;

USE eventplanner;

-- Users Table

CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100),
    username VARCHAR(50),
    hashedPassword VARCHAR(255)
);

-- Events Table

CREATE TABLE IF NOT EXISTS events (
    EventID INT AUTO_INCREMENT PRIMARY KEY,
    OrganiserID INT,
    Name VARCHAR(255) NOT NULL,
    Date DATE NOT NULL,
    Time TIME NOT NULL,
    Location VARCHAR(255) NOT NULL,
    Description TEXT,
    FOREIGN KEY (OrganiserID) REFERENCES users(user_id)
);

-- Stored Procedure for User Registration

CREATE PROCEDURE AddUser(
    IN p_username VARCHAR(255),
    IN p_email VARCHAR(255),
    IN p_hashedPassword VARCHAR(255)
)
BEGIN
    DECLARE hashedPassword VARCHAR(255);
    
    SET hashedPassword = p_hashedPassword;

    INSERT INTO users (username, email, hashedPassword)
    VALUES (p_username, p_email, hashedPassword);
END //
