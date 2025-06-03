# Start from a base image with Java and Spring Boot support
# Use adoptopenjdk for the JRE
# Start with a base image containing Java runtime
FROM eclipse-temurin:21-jdk-alpine

# Set the working directory in the container
WORKDIR /app

# Copy the built JAR file into the container
COPY target/*.jar app.jar

# Expose the application port
# Make port 8080 available to the world outside this container
EXPOSE 8081

# Specify the command to run on container start
ENTRYPOINT ["java", "-jar", "app.jar"]