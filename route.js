const express = require("express");
const router = express.Router();

// Убедитесь, что вы правильно используете синтаксис для объявления маршрута
router.get("/", (req, res) => {
    res.send("server side");
});

module.exports = router;
