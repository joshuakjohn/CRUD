import express from 'express'
import { db } from '../Config/db.config'
import { router } from '../Routes/post.routes'
import morgan from 'morgan';
import logger from '../logger/logger';
import cors from 'cors';
import { consume } from '../Controllers/rabbitmq.controller';


const app = express()

const corsOptions = {
    origin: ['https://example.com', 'https://another-example.com'], // Allowed origins
    methods: ['GET', 'POST'],                                        // Allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'],               // Allowed headers
    credentials: true                                                // Allow cookies and credentials
  };
  
app.use(cors(corsOptions));

//middlewares
app.use(express.json())
app.use(express.urlencoded({extended: true}))


// Use Morgan with Winston
app.use(
    morgan('combined', {
      stream: {
        write: (message) => logger.info(message.trim()), // Morgan logs to Winston
      },
    })
  );

//routes
app.use('/api/v1/posts', router)
app.use('/api/v1/consume', consume)

//db connection then server connection
db.then(() => {
    app.listen(7070, () => console.log('Server is listening on port 7070'))
})