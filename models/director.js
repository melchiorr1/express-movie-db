const express = require("express");

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { DateTime } = require("luxon");

const DirectorSchema = new Schema({
  first_name: { type: String, required: true, maxLength: 100 },
  family_name: { type: String, required: true, maxLength: 100 },
  date_of_birth: { type: Date, required: true },
  date_of_death: { type: Date },
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  image: {type: String},
});

// Virtual for director's full name
DirectorSchema.virtual("name").get(function () {
  return this.family_name + ", " + this.first_name;
});

// Virtual for director's url
DirectorSchema.virtual("url").get(function () {
  return "/catalog/director/" + this._id;
});

DirectorSchema.virtual("date_of_birth_formatted").get(function () {
  let born = DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED);
  return born;
});

DirectorSchema.virtual("date_of_death_formatted").get(function () {
  if (!this.date_of_death) return "";
  let died = DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED);
  return died;
});

DirectorSchema.virtual("date_of_birth_yyyy_mm_dd").get(function () {
  return DateTime.fromJSDate(this.date_of_birth).toISODate(); //format 'YYYY-MM-DD'
});

DirectorSchema.virtual("date_of_death_yyyy_mm_dd").get(function () {
  return DateTime.fromJSDate(this.date_of_death).toISODate(); //format 'YYYY-MM-DD'
});

module.exports = mongoose.model("Director", DirectorSchema);