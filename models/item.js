var mongoose = require("mongoose");
//SCHEMA SETUP
var itemSchema = new mongoose.Schema({
   name: String,
   price: Number,
   description: String,
   image: String,
   author: {
      id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      username: String
   }
});

module.exports = mongoose.model("Item", itemSchema);         //makes model that has methods for us to interact with
