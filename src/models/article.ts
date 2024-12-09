import mongoose from "mongoose";

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    default: "Anonymous",
  },
  date: {
    type: Date,
    default: () => Date.now(),
  },
});

const Article = mongoose.model("article", articleSchema);

export default Article;
