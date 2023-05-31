\set ON_ERROR_STOP true

/*
  ########### NEXT AUTH AND ACCOUNT TABLES ###########
*/
CREATE TABLE verification_token
(
  identifier TEXT NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  token TEXT NOT NULL,

  PRIMARY KEY (identifier, token)
);

CREATE TABLE accounts
(
  id SERIAL,
  "userId" INTEGER NOT NULL,
  type VARCHAR(255) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  "providerAccountId" VARCHAR(255) NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  id_token TEXT,
  scope TEXT,
  session_state TEXT,
  token_type TEXT,

  PRIMARY KEY (id)
);

CREATE TABLE sessions
(
  id SERIAL,
  "userId" INTEGER NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  "sessionToken" VARCHAR(255) NOT NULL,

  PRIMARY KEY (id)
);

CREATE TABLE users
(
  id SERIAL,
  name VARCHAR(255),
  email VARCHAR(255),
  "emailVerified" TIMESTAMPTZ,
  image TEXT,

  PRIMARY KEY (id)
);


CREATE UNIQUE INDEX account_id ON accounts(id);

CREATE INDEX provider_account_id ON accounts("providerAccountId");

CREATE INDEX provider_id ON accounts(provider);

CREATE INDEX user_id ON accounts("userId");

CREATE UNIQUE INDEX access_token ON accounts(access_token);

CREATE UNIQUE INDEX session_token ON sessions("sessionToken");

CREATE UNIQUE INDEX email ON users(email);
