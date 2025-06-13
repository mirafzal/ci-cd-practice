# Stage 1: Build the Go binary
FROM golang:1.21-alpine AS builder

# Set necessary Go environment variables
ENV CGO_ENABLED=0 \
    GOOS=linux \
    GOARCH=amd64

WORKDIR /app

# Copy and download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the application code
COPY . .

# Build the Go binary
RUN go mod tidy
RUN go build -o main .

# Stage 2: Create a minimal final image
FROM scratch

# Import from builder stage
COPY --from=builder /app/main /main

# Expose the application port
EXPOSE 8080

# Run the binary
ENTRYPOINT ["/main"]
