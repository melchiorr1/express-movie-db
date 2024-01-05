const express = require('express');
const mongoose = require('mongoose');
const {DateTime} = require('luxon');

const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    username: { type: String, required: true, maxLength: 100 },
    comment: { type: String, required: true, maxLength: 500 },
    date: { type: Date, default: Date.now },
    });

CommentSchema.virtual('date_formatted').get(function () {
    return DateTime.fromJSDate(this.date).toLocaleString(DateTime.DATETIME_SHORT);
});

module.exports = mongoose.model('Comment', CommentSchema);