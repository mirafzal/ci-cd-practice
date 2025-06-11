# Stage 1: Build Stage
FROM maven:3.8.4-openjdk-17-slim AS build

# Set the working directory
WORKDIR /app

# Copy the Maven POM file and download dependencies
COPY src/pom.xml .

# Download dependencies (this layer is cached if dependencies don't change)
RUN mvn dependency:go-offline

# Copy the rest of the application source code
COPY src ./src

# Package the application into a JAR file
RUN mvn clean package -DskipTests

# Stage 2: Runtime Stage
FROM openjdk:17-jdk-slim

# Set the working directory
WORKDIR /app

# Copy the JAR file from the build stage
COPY --from=build /app/target/user-service-1.0-SNAPSHOT.jar /app/user-service.jar

# Expose the port the app will run on
EXPOSE 8081

# Command to run the application
ENTRYPOINT ["java", "-jar", "/app/user-service.jar"]
