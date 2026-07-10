import express from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/errorHandler.ts";
import authRoutes from "./routes/authRoutes.ts"
import routes from "./routes/routes.ts"
import config from "./config/config.ts";

const app = express();

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.BETTER_AUTH_URL
    : true,
  credentials: true,
}));
app.use('/api/auth', authRoutes);

app.use(express.json());
app.use('/api', routes)

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`)
})
