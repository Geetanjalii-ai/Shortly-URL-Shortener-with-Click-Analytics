import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.database_connection_string,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.query('SELECT NOW()',(err, res)=>{
  if(err){
    console.error('Error connecting to the database:',err.stack);
  }
  else
  {
     console.log('Database connected successfully to your cloud Database');
  }
});

export default pool;