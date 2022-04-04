const mongoose=require("mongoose")

let urlSchemma=new mongoose.Schema({ 
    urlCode: {
        type:String,
        required:true,
         unique:true ,
        lowercase:true ,
        trim :true
    },
    longUrl: {
        type:String,
        required:true,
    },        //mandatory, valid url}, 
     shortUrl: {
         type:String,
         required:true,
         unique:true
        } 

    },{timestamps:true})


module.exports=mongoose.model("url",urlSchemma)