import Redis from 'redis';

const redisClient = Redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
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

export const connectRedis = async () => {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }
        console.log('Connected to Redis');
    } catch (error) {
        console.error('Redis connection failed:', error);
        throw error;
    }
};

export { redisClient };

//cache utility functions

export const cacheService =  {
    //GET function from redis
    async get (key: string){
        try {
            if (!redisClient.isOpen) {
                console.log('Redis not connected, skipping cache get');
                return null;
            }
            const value = await redisClient.get(key);
            return value ? JSON.parse(value) : null; //converts the string stored in redis to JSON object
        } catch(error){
            console.error('Cache got error: ',error);
            return null;
        }
    },

    //SET function 
    async set (key:string, value:any , ttlSeconds:number = 3600) {
        try{   
            if (!redisClient.isOpen) {
                console.log('Redis not connected, skipping cache set');
                return;
            }
            await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));

        }catch(error){
            console.error('Cache set error: ', error);
        }
    },

    //DELETE function
    async del(key:string){
        try{
            if (!redisClient.isOpen) {
                console.log('Redis not connected, skipping cache delete');
                return;
            }
            await redisClient.del(key);
        }catch(error){
            console.error('Cache delete error: ', error);
        }
    },

    async exists(key:string): Promise<boolean> {
        try{
            if (!redisClient.isOpen) {
                console.log('Redis not connected, skipping cache exists');
                return false;
            }
            const result = await redisClient.exists(key);
            return result === 1;
        }catch(error){
            console.error('Cache exists error: ',error);
            return false;
        }
    }
};

