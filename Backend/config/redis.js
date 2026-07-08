import {createClient} from 'redis';
import dotenv from 'dotenv';

dotenv.config();

//Initialize the redis client using your cloud connection string

const redisClient=createClient({
  url:process.env.redis_url
});

redisClient.on('connect',()=>{
  console.log('Redis cache connected successfully in the cloud.');
});

redisClient.on('error',(err)=>{
  console.error('Redis Client Connection Error:',err);
});

/**
 * Top-Level Await: ES Modules allow us to await the connection right here.
 * This guarantees that your server won't start serving requests before 
 * the cache connection is fully active.
 */
await redisClient.connect();

export default redisClient;