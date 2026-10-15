-- =============================================================================
-- Enterprise Attendance & Workforce Management System (AMS)
-- Production PostgreSQL DDL Schema
-- Compatible with PostgreSQL 15+ / AWS Aurora / Supabase / Neon
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('AGENT', 'TEAM_LEADER', 'ADMIN', 'SUPER_ADMIN');
CREATE TYPE user_shift_status AS ENUM ('ON_SHIFT', 'ON_BREAK', 'OFF_SHIFT', 'EXCUSED');
CREATE TYPE shift_type AS ENUM ('MORNING', 'AFTERNOON', 'NIGHT', 'SPLIT', 'OVERTIME', 'OFF_DAY', 'ON_CALL', 'TRAINING');
CREATE TYPE shift_status AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'SWAP_PENDING', 'CANCELLED');
CREATE TYPE location_type AS ENUM ('ON_SITE', 'REMOTE', 'HYBRID');
CREATE TYPE swap_status AS ENUM ('PENDING_PEER', 'PEER_ACCEPTED', 'APPROVED_BY_TL', 'REJECTED', 'CANCELLED');
CREATE TYPE excuse_category AS ENUM ('SYSTEM_FAILURE', 'LEARNING_TRAINING', 'MEETINGS', 'MISCELLANEOUS', 'HEALTH_EMERGENCY');
CREATE TYPE excuse_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'NEEDS_INFO');

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id VARCHAR(32) NOT NULL UNIQUE,
    name VARCHAR(128) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'AGENT',
    department VARCHAR(100) NOT NULL,
    shift_group VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    current_shift_status user_shift_status NOT NULL DEFAULT 'OFF_SHIFT',
    created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_agent_id ON users(agent_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_department ON users(department);

-- 3. SHIFTS TABLE
CREATE TABLE IF NOT EXISTS shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shift_date DATE NOT NULL,
    start_time TIMESTAMPTZ(6) NOT NULL,
    end_time TIMESTAMPTZ(6) NOT NULL,
    type shift_type NOT NULL DEFAULT 'MORNING',
    status shift_status NOT NULL DEFAULT 'SCHEDULED',
    location location_type NOT NULL DEFAULT 'ON_SITE',
    notes TEXT,
    allow_swap BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_shift UNIQUE (user_id, shift_date, start_time),
    CONSTRAINT chk_shift_time_valid CHECK (end_time > start_time)
);

CREATE INDEX idx_shifts_user_date ON shifts(user_id, shift_date);
CREATE INDEX idx_shifts_date_type ON shifts(shift_date, type);
CREATE INDEX idx_shifts_status ON shifts(status);

-- 4. SHIFT SWAPS TABLE (Peer-to-Peer + Two-stage TL Approval Engine)
CREATE TABLE IF NOT EXISTS shift_swaps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    requester_shift_id UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
    target_peer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_shift_id UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
    status swap_status NOT NULL DEFAULT 'PENDING_PEER',
    swap_reason TEXT NOT NULL,
    peer_response_notes TEXT,
    peer_responded_at TIMESTAMPTZ(6),
    tl_approver_id UUID REFERENCES users(id) ON DELETE SET NULL,
    tl_notes TEXT,
    tl_reviewed_at TIMESTAMPTZ(6),
    conflict_check_passed BOOLEAN NOT NULL DEFAULT true,
    conflict_details JSONB,
    created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_different_agents CHECK (requester_id <> target_peer_id),
    CONSTRAINT chk_different_shifts CHECK (requester_shift_id <> target_shift_id)
);

CREATE INDEX idx_shift_swaps_requester ON shift_swaps(requester_id, status);
CREATE INDEX idx_shift_swaps_peer ON shift_swaps(target_peer_id, status);
CREATE INDEX idx_shift_swaps_status ON shift_swaps(status);

-- 5. EXCUSE LOGS TABLE (Agent Exception & System Outage Logging)
CREATE TABLE IF NOT EXISTS excuse_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shift_id UUID REFERENCES shifts(id) ON DELETE SET NULL,
    category excuse_category NOT NULL,
    sub_category VARCHAR(128) NOT NULL,
    from_time TIMESTAMPTZ(6) NOT NULL,
    to_time TIMESTAMPTZ(6) NOT NULL,
    duration_minutes INT NOT NULL,
    reason TEXT NOT NULL,
    ticket_number VARCHAR(64),
    attachment_url VARCHAR(512),
    attachment_name VARCHAR(255),
    status excuse_status NOT NULL DEFAULT 'PENDING',
    tl_approver_id UUID REFERENCES users(id) ON DELETE SET NULL,
    tl_feedback TEXT,
    reviewed_at TIMESTAMPTZ(6),
    created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_excuse_time CHECK (to_time > from_time),
    CONSTRAINT chk_duration_positive CHECK (duration_minutes > 0)
);

CREATE INDEX idx_excuse_user_status ON excuse_logs(user_id, status);
CREATE INDEX idx_excuse_category ON excuse_logs(category, status);
CREATE INDEX idx_excuse_time_window ON excuse_logs(from_time, to_time);

-- 6. AUDIT LOGS TABLE (Enterprise Compliance Trail)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    details JSONB NOT NULL,
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity, entity_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at DESC);

-- 7. AUTOMATED TIMESTAMP UPDATE TRIGGER
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();
CREATE TRIGGER trg_shifts_updated_at BEFORE UPDATE ON shifts FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();
CREATE TRIGGER trg_shift_swaps_updated_at BEFORE UPDATE ON shift_swaps FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();
CREATE TRIGGER trg_excuse_logs_updated_at BEFORE UPDATE ON excuse_logs FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();
