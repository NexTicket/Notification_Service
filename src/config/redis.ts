import Redis from 'redis';

const redisClient = Redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6380',
    socket: {
        reconnectStrategy: (retries) => {
            if (retries > 10) {
                console.error('Too many Redis reconnection attempts, giving up');
                return new Error('Redis reconnection limit exceeded');
            }
            const delay = Math.min(retries * 100, 3000);
            console.log(`Redis reconnecting in ${delay}ms (attempt ${retries})`);
            return delay;
        },
        connectTimeout: 10000,
    },
});

redisClient.on('error',(err)=>{
    console.error('Redis Client Error:',err);
})

redisClient.on('connect',()=>{
    console.log('Connected to Redis');
})

redisClient.on('reconnecting',()=>{
    console.log('Reconnecting to Redis .. ');
})

redisClient.on('ready', () => {
    console.log('Redis client is ready');
});

export { redisClient };

export const connectRedis = async() => {
    if(!redisClient.isOpen){
        await redisClient.connect();
    }
};

//cache utility functions

export const cacheService =  {
    //GET function from redis
    async get (key: string){
        try {
            const value = await redisClient.get(key);
            return value ? JSON.parse(value) : null; //converts the string stroed in redis to JSON object
        } catch(error){
            console.error('Cache got error: ',error);
            return null;
        }
    },

    //SET function 
    async set (key:string, value:any , ttlSeconds:number = 3600) {
        try{   
            await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));

        }catch(error){
            console.error('Cache set error: ', error);
        }
    },

    //DELETE function
    async del(key:string){
        try{
            await redisClient.del(key);
        }catch(error){
            console.error('Cache delete error: ', error);
        }
    },

    async exists(key:string): Promise<boolean> {
        try{
            const result = await redisClient.exists(key);
            return result === 1;
        }catch(error){
            console.error('Cache exists error: ',error);
            return false;
        }
    }
};

