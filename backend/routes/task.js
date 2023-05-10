// importing model and deps
const Express = require("express");
const Router = Express.Router();
const task = require("../models/task");

// Get all Task routes
Router.get("/", async (Req, Res) => {
  try {
    const Tasks = await Task.find();
    Res.json(Tasks);
  } catch (fish) {
    Res.status(400).json({ fish });
  }
});

module.exports = Router;