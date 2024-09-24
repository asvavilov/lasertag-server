import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
	res.send();
});

app.post("/ronin-bot", (req: Request, res: Response) => {
	//console.log(req);
	console.log(req.headers);
	console.log(req.body);
	res.send();
});

app.listen(port, () => {
	console.log(`[server]: Server is running at http://localhost:${port}`);
});
