# CraftSpace Backend

A Spring Boot-based backend for the CraftSpace personal knowledge base and note-taking application.

## Technology Stack

- Java 17
- Spring Boot 3.2.0
- PostgreSQL 15
- JWT for authentication
- Maven for dependency management

## Prerequisites

- JDK 17 or higher
- PostgreSQL 15 or higher
- Maven 3.8+

## Project Structure

```
src/main/java/com/notus/
├── CraftSpaceApplication.java    # Main application class
├── config/                      # Configuration classes
├── controller/                  # REST controllers
├── service/                     # Business logic
├── repository/                  # Data access layer
├── entity/                      # Database entities
├── dto/                        # Data transfer objects
│   ├── request/               # Request DTOs
│   └── response/              # Response DTOs
├── exception/                  # Custom exceptions
└── util/                      # Utility classes
```

## Setup Instructions

1. Install Prerequisites:

   - Install JDK 17
   - Install PostgreSQL 15
   - Install Maven

2. Database Setup:

   ```sql
   CREATE DATABASE craft_space;
   ```

3. Configure Application:

   - Update `src/main/resources/application.properties` with your database credentials
   - Configure email settings in application.properties
   - Set a secure JWT secret key

4. Build and Run:
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

## API Documentation

Once the application is running, access the API documentation at:

- Swagger UI: http://localhost:8080/api/swagger-ui.html
- OpenAPI docs: http://localhost:8080/api/v3/api-docs

## Development Guidelines

1. Follow standard Java naming conventions
2. Write unit tests for all new features
3. Document all API endpoints
4. Use appropriate HTTP status codes
5. Handle exceptions properly

## Security Considerations

- JWT tokens expire after 24 hours
- Passwords are hashed using BCrypt
- Input validation on all endpoints
- Rate limiting on authentication endpoints
- CORS configuration required for production
