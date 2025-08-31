import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
    log: ['query', 'info', 'warn','error'],
});

// Test database connection
export const connectDatabase = async() => {
    try{
        await prisma.$connect();
        console.log('Postgres connected');
    }catch(error){
        console.error('Database connection failed', error);
        throw error;
    }
}

//Graceful shutdown
process.on('SIGINT',async ()=>{
    await prisma.$disconnect();
    process.exit(0);
});