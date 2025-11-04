-- Initialize separate database for each microservice
-- This script runs when PostgreSQL container starts for the first time

-- Create database for each service
CREATE DATABASE notesverb_auth;
CREATE DATABASE notesverb_users;
CREATE DATABASE notesverb_notes;
CREATE DATABASE notesverb_tags;


-- Grant permissions to the notesverb user
GRANT ALL PRIVILEGES ON DATABASE notesverb_auth TO notesverb;
GRANT ALL PRIVILEGES ON DATABASE notesverb_users TO notesverb;
GRANT ALL PRIVILEGES ON DATABASE notesverb_notes TO notesverb;
GRANT ALL PRIVILEGES ON DATABASE notesverb_tags TO notesverb;