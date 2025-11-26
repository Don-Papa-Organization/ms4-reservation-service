import express, { Express } from "express";
import {
	mesaRoutes,
	reservaRoutes,
} from './routes';

const app: Express = express();

app.use(express.json());

app.use('/db/mesas', mesaRoutes);
app.use('/db/reservas', reservaRoutes);

export default app;