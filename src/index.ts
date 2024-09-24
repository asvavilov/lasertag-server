import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());

/*
app.get("/ronin-bot", (req: Request, res: Response) => {
	console.log(process.env)
	const url = `https://api.telegram.org/bot${process.env.BOT_ID}:${process.env.BOT_SECRET}/sendMessage`;
	const text = 'hello from express';
	console.log(url)
	fetch(url, {
		method: 'POST',
		headers: {
      'Content-Type': 'application/json'
    },
		body: JSON.stringify({
			chat_id: process.env.TEST_GROUP,
			text: text
		})
	});
	res.send();
});
*/

app.post("/ronin-bot", (req: Request, res: Response) => {
	//console.log(req);
	console.log(req.headers);
	console.log(req.body);
	res.send();
});

app.listen(port, () => {
	console.log(`[server]: Server is running at http://localhost:${port}`);
});
