import express from "express";

import pedidosRouter from "./routes/pedidos.js";

const app = express();

global.fileName = "pedidos.json";

app.use(express.json());

app.use("/pedidos", pedidosRouter);

app.listen(3000, () => {
  console.log("API started");
});
