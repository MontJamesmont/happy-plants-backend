const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({  
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    required: true
  }
  ,
  plants: [{ type: Schema.Types.ObjectId, ref: 'Plant' }]
},
{ timestamps: true });

const User = mongoose.model("users", UserSchema);

module.exports = User;
