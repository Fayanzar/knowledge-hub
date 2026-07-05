import express from "express";
import type { Request } from "express";
import { errorHandler } from "./middlewares/errorHandler.ts";
import routes from "./routes/routes.ts"
import config from "./config/config.ts";
import cors from "cors";

const app = express();

app.use(cors<Request>());
app.use(express.json());

app.use('/api', routes)

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`)
})
