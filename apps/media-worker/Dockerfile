
FROM golang:alpine AS builder
WORKDIR /app


COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -o worker ./src/main.go

FROM alpine:latest

RUN apk add --no-cache ffmpeg
WORKDIR /app

COPY --from=builder /app/worker .

CMD ["./worker"]