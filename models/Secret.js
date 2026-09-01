const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const SecretSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  }
});

const Secret = mongoose.model("secrets", SecretSchema);

module.exports = Secret;
