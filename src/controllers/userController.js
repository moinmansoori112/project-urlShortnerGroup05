const express = require("express")
const validUrl = require("valid-url")
const shortId = require("shortid")
//const config=require("config")
const userModel = require("../models/userModel")
//const { isValid } = require("shortid")

const isValid = (value) => {
    if (typeof value === "undefined" || value === null) return false

    if (typeof value === "string" && value.trim().length === 0) false

    else {

        return true
    }
}



const baseUrl = "http://localhost:3000"

const shortner = async (req, res) => {
    try {
        const data = req.body
        const { urlCode, longUrl } = data

        // if (!isValid(urlCode)) {
        //     return res.status(400).send({ status: false, msg: "please enter urlcode" })
        // }
        const findUrl = await userModel.findOne({ urlCode })
        // if (findUrl) {
        //     return res.status(400).send({ status: false, msg: "this urlcode already used please enter some other urlcode" })
        // }
        if (!isValid(longUrl)) {
            return res.status(400).send({ status: false, msg: "please enter longUrl" })
        }

        if (!validUrl.isUri(baseUrl)) {
            return res.status(401).send({ status: false, msg: "base url is not valid" })
        }

        var short = shortId.generate()

        if (validUrl.isUri(longUrl)) {

            let url = await userModel.findOne({ longUrl })//.select({ createdAt: 0, updatedAt: 0, __v: 0 })
            if (url) {
                return res.status(200).send({ status: true, msg: "this URL is already shorted" })

            }

            let shortedUrl = baseUrl + "/" + short

            let input = { longUrl: data.longUrl, shortUrl: shortedUrl, urlCode:short }

            const created = await userModel.create(input)

            const output = {
                urlCode:created.urlCode,
                longUrl: created.longUrl,
                shortUrl: created.shortUrl,
                
            }
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

const getUrl = async (req, res) => {
    try{
        const data = req.params
        
    if (!data) {
        return res.status(400).send({ status: false, msg: "please enter urlcode" })
    }
    const{urlCode}=data

    const findUrl=await userModel.findOne({urlCode:urlCode})

    if(!findUrl){
        return res.status(404).send({status:false,msg:"this url is not available"})
    }

    return res.status(301).redirect(findUrl.longUrl)
    }
    catch(err){
        return res.status(500).send({status:false,msg:err.message})
    }


}

// const getUrl = async (req, res) => {
//     try {
//         const { urlCode } = req.params;

//         if (!isValid(urlCode)) return res.status(400).send({ status: false, message: "Invalid Url" })

//         const result = await userModel.findOne({ urlCode: urlCode })
//         if (!result) {
//             return res.status(404).send({ status: false, msg: "Url doesn't exist" });
//         }

//         res.status(301).redirect(result.longUrl)


//     } catch (error) {
//         res.status(500).send({ status: true, msg: error.message })
//     }
// }











module.exports.getUrl=getUrl

module.exports.shortner = shortner