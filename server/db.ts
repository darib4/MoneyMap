import pg from "pg";

const pool = new pg.Pool({
    connectionTimeoutMillis: 5000
});

export default pool;