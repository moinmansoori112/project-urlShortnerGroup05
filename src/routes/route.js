const express = require('express');
const router = express.Router();
//const UrlModel= require("../models/urlModel.js")
const urlController= require("../controllers/urlController")

router.get("/test-me", function (req, res) {
    res.send("My first ever api!")
})

router.post("/url/shorten",urlController.shortner)

router.get("/:urlCode",urlController.getUrl)


module.exports = router;