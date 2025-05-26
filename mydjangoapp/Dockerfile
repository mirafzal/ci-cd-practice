# === Stage 1: Build Stage ===
FROM python:3.11-alpine as builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache \
    build-base \
    libffi-dev \
    postgresql-dev \
    musl-dev \
    gcc \
    python3-dev \
    cargo \
    && pip install --upgrade pip

# Copy and install dependencies
COPY requirements.txt .
RUN pip install --user -r requirements.txt

# Copy application code
COPY . .

# === Stage 2: Runtime Stage ===
FROM python:3.11-alpine as runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH=/root/.local/bin:$PATH

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache \
    libpq \
    libffi

# Copy installed dependencies and app code from build stage
COPY --from=builder /root/.local /root/.local
COPY --from=builder /app /app

# Optional: collect static files
# RUN python manage.py collectstatic --noinput

# CMD to run the Gunicorn server
CMD ["gunicorn", "mydjangoapp.wsgi:application", "--bind", "0.0.0.0:8000"]
