const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

router.get("/db-test", async (req, res) => {
    try {
        const state = mongoose.connection.readyState;

        /*
          0 = disconnected
          1 = connected
          2 = connecting
          3 = disconnecting
        */

        res.json({
            success: true,
            mongoState: state,
            message: state === 1 ? "MongoDB conectado correctamente" : "MongoDB NO conectado"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
