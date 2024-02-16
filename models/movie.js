const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const MovieSchema = new Schema({
  title: { type: String, required: true },
  director: {
    type: Schema.Types.ObjectId,
    ref: "Director",
    required: true,
  },
  summary: { type: String, required: true },
  year: { type: Number, required: true },
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  image: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
});

// Virtual for movie's URL
MovieSchema.virtual("url").get(function () {
  return "/catalog/movie/" + this._id;
});

module.exports = mongoose.model("Movie", MovieSchema);
