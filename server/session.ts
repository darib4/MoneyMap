import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import pool from "./db.js";

const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret || sessionSecret.length < 32) {
    throw new Error(
        "SESSION_SECRET must contain at least 32 characters."
    );
}

const PgSession = connectPgSimple(session);

const sessionMiddleware = session({
    name: "moneymap.sid",
    secret: sessionSecret,

    store: new PgSession({
        pool,
        tableName: "sessions",
        createTableIfMissing: true
    }),

    resave: false,
    saveUninitialized: false,

    cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24
    }
});

export default sessionMiddleware;