import express from "express";
import { promises } from "fs";

const { readFile, writeFile } = promises;

const router = express.Router();
//1
router.post("/", async (req, res) => {
  let pedido = req.body;
  try {
    let pedidos = JSON.parse(await readFile(global.fileName));
    pedido = {
      id: pedidos.nextId++,
      timestamp: new Date(),
      entregue: false,
      ...pedido,
    };
    pedidos.pedidos.push(pedido);

    await writeFile(global.fileName, JSON.stringify(pedidos));

    res.send(pedido);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});
//2
router.put("/:id", async (req, res) => {
  try {
    let newPedido = req.body;
    let json = JSON.parse(await readFile(global.fileName));
    let index = json.pedidos.findIndex(
      (pedido) => pedido.id === parseInt(req.params.id, 10)
    );

    if (index === -1) {
      throw new Error("id não existe");
    }

    if (newPedido.cliente) {
      json.pedidos[index].cliente = newPedido.cliente;
    }

    if (newPedido.produto) {
      json.pedidos[index].produto = newPedido.produto;
    }

    if (newPedido.valor) {
      json.pedidos[index].valor = newPedido.valor;
    }

    if (newPedido.entregue) {
      json.pedidos[index].entregue = newPedido.entregue;
    }

    await writeFile(global.fileName, JSON.stringify(json, null, 2));

    res.send(json.pedidos[index]);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

//3
router.patch("/:id", async (req, res) => {
  try {
    let json = JSON.parse(await readFile(global.fileName));

    let index = json.pedidos.findIndex(
      (pedido) => pedido.id === parseInt(req.params.id, 10)
    );

    if (index === -1) {
      throw new Error("id não existe");
    }

    json.pedidos[index].entregue = true;

    await writeFile(global.fileName, JSON.stringify(json, null, 2));

    res.send(json.pedidos[index]);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

//4
router.delete("/:id", async (req, res) => {
  try {
    let json = JSON.parse(await readFile(global.fileName));

    let index = json.pedidos.findIndex(
      (pedido) => pedido.id === parseInt(req.params.id, 10)
    );

    if (index === -1) {
      throw new Error("id não existe");
    }

    const pedidos = json.pedidos.filter(
      (pedido) => pedido.id !== parseInt(req.params.id, 10)
    );

    json.pedidos = pedidos;

    await writeFile(global.fileName, JSON.stringify(json, null, 2));

    res.send(json.grades);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

//5

router.get("/:id", async (req, res) => {
  try {
    let json = JSON.parse(await readFile(global.fileName));

    let index = json.pedidos.findIndex(
      (pedido) => pedido.id === parseInt(req.params.id, 10)
    );

    if (index === -1) {
      throw new Error("id não existe");
    }
    res.send(json.pedidos[index]);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

//6

router.post("/total", async (req, res) => {
  try {
    const json = JSON.parse(await readFile(global.fileName));
    const pedidos = json.pedidos.filter(
      (pedido) =>
        pedido.cliente === req.body.cliente && pedido.entregue === true
    );

    const total = pedidos.reduce((prev, curr) => {
      return prev + curr.valor;
    }, 0);

    res.send({ total });
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

//7

router.post("/totalProduto/:produto", async (req, res) => {
  try {
    const json = JSON.parse(await readFile(global.fileName));
    const pedidos = json.pedidos.filter(
      (pedido) =>
        pedido.produto === req.params.produto && pedido.entregue === true
    );

    const total = pedidos.reduce((prev, curr) => {
      return prev + curr.valor;
    }, 0);

    res.send({ total });
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

//8

router.post("/best", async (req, res) => {
  try {
    const json = JSON.parse(await readFile(global.fileName));
    let pedidosEntregues = json.pedidos.filter(
      (item) => item.entregue != false
    );
    const produtos = [];

    pedidosEntregues.forEach((order) => {
      const index = produtos.findIndex(
        (item) => item.produto === order.produto
      );
      if (index === -1) {
        produtos.push({
          produto: order.produto,
          quantidade: 1,
        });
      } else {
        produtos[index].quantidade++;
      }
    });

    produtos.sort((a, b) => b.quantidade - a.quantidade);

    res.send(produtos);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

export default router;
