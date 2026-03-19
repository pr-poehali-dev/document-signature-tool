
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    company VARCHAR(255),
    phone VARCHAR(50),
    position VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP
);

CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    token VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL
);

CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(500) NOT NULL,
    file_type VARCHAR(20),
    file_size INTEGER,
    s3_key VARCHAR(500),
    signed_s3_key VARCHAR(500),
    action VARCHAR(50) DEFAULT 'uploaded',
    status VARCHAR(50) DEFAULT 'pending',
    has_signature BOOLEAN DEFAULT FALSE,
    has_stamp BOOLEAN DEFAULT FALSE,
    sign_x INTEGER,
    sign_y INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE signatures (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(255),
    type VARCHAR(20) NOT NULL,
    data TEXT,
    s3_key VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE stamps (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(255),
    shape VARCHAR(20) DEFAULT 'round',
    company VARCHAR(255),
    text VARCHAR(255),
    inn VARCHAR(100),
    color VARCHAR(20) DEFAULT '#1a3a6e',
    is_library BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE extracted_elements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    document_id INTEGER REFERENCES documents(id),
    element_type VARCHAR(20),
    s3_key VARCHAR(500),
    saved_locally BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
