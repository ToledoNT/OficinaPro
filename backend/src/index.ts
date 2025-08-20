import dotenv from "dotenv";
dotenv.config();

import { server } from "./server";

const PORT = 4001;
const HOST = "0.0.0.0";

server.listen(PORT, HOST, () => {
  console.clear();
  console.log(`--Server ON--`);
});