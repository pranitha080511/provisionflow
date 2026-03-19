import pkg from "pg";
const { Pool } = pkg;
import { DB_URL } from "./config/env.js";

const pool = new Pool({
    connectionString: DB_URL,
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});

export default pool;