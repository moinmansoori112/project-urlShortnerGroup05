const express = require("express")
const validUrl = require("valid-url")
const shortId = require("shortid")
//const config=require("config")
const urlModel = require("../models/urlModel")
//const { isValid } = require("shortid")
const redis = require("redis")
const { promisify } = require("util");

//Connect to redis
//Connect to redis
const redisClient = redis.createClient(
    12354,//portnu
    "redis-12354.c212.ap-south-1-1.ec2.cloud.redislabs.com",          //string
    { no_ready_check: true }
);
redisClient.auth("CmfJZXArfE6eSUjfyXxzmgCHtPKXuXFr", function (err) { ///password
    if (err) throw err;
});

redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
});

//1. connect to the server
//2. use the commands :

//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);



const isValid = (value) => {
    if (typeof value === "undefined" || value === null) return false

    if (typeof value === "string" && value.trim().length === 0) false

    else {

        return true
    }
}
const isValidUrl = function (longUrl) {
    return /^(http(s)?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/.test(longUrl)
}




//const baseUrl = "http://localhost:3000"

const shortner = async (req, res) => {
    try {
        const baseUrl = "http://localhost:3000"
        const data = req.body
        const { urlCode, longUrl } = data

        if (!isValid(longUrl)) {
            return res.status(400).send({ status: false, msg: "please enter longUrl" })
        }

        if (!(/^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/.test(longUrl))) {
            return res.status(400).send({ msg: false, msg: "URL is not valid " })
        }

        // let cahcedUrlCode = await GET_ASYNC(`${req.body}`)
        // console.log("this  is also come from cache memory")

        // if (cahcedUrlCode) {
        //     parseData = JSON.parse(cahcedUrlCode)
        //     console.log("this is come from cache")
        //     return res.status(302).redirect(parseData.longUrl)
        // }



        if (!validUrl.isUri(baseUrl)) {
            return res.status(401).send({ status: false, msg: "base url is not valid" })
        }
        var short = shortId.generate().toLowerCase()

        // let cahcedUrlCode = await GET_ASYNC(`${req.body}`)

        // console.log("this  is also come from cache memory")

        // if (cahcedUrlCode) {
        //     parseData = JSON.parse(cahcedUrlCode)
        //     console.log("this is come from cache")
        //     return res.status(302).redirect(parseData.longUrl)
        // }

        if (validUrl.isUri(longUrl)) {

            let url = await urlModel.findOne({ longUrl }).select({ createdAt: 0, updatedAt: 0, __v: 0, _id: 0 })
            if (url) {
                return res.status(200).send({ status: true, data: url })

            }

            let shortedUrl = baseUrl + "/" + short

            let input = { longUrl: data.longUrl, shortUrl: shortedUrl, urlCode: short }

            const created = await urlModel.create(input)

            const output = {
                longUrl: created.longUrl,
                shortUrl: created.shortUrl,
                urlCode: created.urlCode,


            }
            await SET_ASYNC(`${short}`, JSON.stringify(created))
            return res.status(201).send({ status: true, msg: "URL shorted", data: output })


        }

        else {
            return res.status(401).send({ status: false, msg: "URL not valid" })
        }

    } catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, msg: err.message })
    }

}


const getUrl = async function (req, res) {
    try {
        const code = req.params.urlCode;

        if (!isValid(code)) {
            return res.status(400).send({ status: false, msg: "Please pass Url Code In Params" })
        }

        let cahcedUrlCode = await GET_ASYNC(`${req.params.urlCode}`)

        if (cahcedUrlCode) {
            parseData = JSON.parse(cahcedUrlCode)
            console.log("this is come from cache")
            return res.status(302).redirect(parseData.longUrl)
        }

        const data = await urlModel.findOne({ urlCode: code }).select({ createdAt: 0, updatedAt: 0, __v: 0 })
        if (!data) {
            return res.status(404).send({ status: false, msg: "No Such URL found" })
        }

        else {
            await SET_ASYNC(`${req.params.urlCode}`, JSON.stringify(data))

            return res.status(302).redirect(data.longUrl)

        }
    }
    catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}


module.exports.getUrl = getUrl

module.exports.shortner = shortner