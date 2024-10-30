import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { jsonDataRouter } from "./routes/jsonData.routes";

dotenv.config();

const PORT = process.env.PORT;

const app = express();

app.use(cors());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use("/api/v1/store-json", jsonDataRouter);
app.use("/api/v1/retrieve-json", jsonDataRouter);

app.use((req, res) => {
  res.send("Hello from the server!");
});

app.listen(PORT, () => {
  console.log(`Server is listening on Port - ${PORT}`);
});
