import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import Article from "./models/article";

const app = express();
const port = 4000;

mongoose.connect(
  "mongodb+srv://admin_user:Iamadminuser@cluster0.o8kab.mongodb.net/blogDB?retryWrites=true&w=majority&appName=Cluster0"
);

const post1 = new Article({
  title: "The Rise of Decentralized Finance",
  content:
    "Decentralized Finance (DeFi) is an emerging and rapidly evolving field in the blockchain industry. It refers to the shift from traditional, centralized financial systems to peer-to-peer finance enabled by decentralized technologies built on Ethereum and other blockchains. With the promise of reduced dependency on the traditional banking sector, DeFi platforms offer a wide range of services, from lending and borrowing to insurance and trading.",
  author: "Alex Thompson",
  date: new Date("2023-08-01T10:00:00Z"),
});

const post2 = new Article({
  title: "The Impact of Artificial Intelligence on Modern Businesses",
  content:
    "Artificial Intelligence (AI) is no longer a concept of the future. It's very much a part of our present, reshaping industries and enhancing the capabilities of existing systems. From automating routine tasks to offering intelligent insights, AI is proving to be a boon for businesses. With advancements in machine learning and deep learning, businesses can now address previously insurmountable problems and tap into new opportunities.",
  author: "Mia Williams",
  date: new Date("2023-08-05T14:30:00Z"),
});

const post3 = new Article({
  title: "Sustainable Living: Tips for an Eco-Friendly Lifestyle",
  content:
    "Sustainability is more than just a buzzword; it's a way of life. As the effects of climate change become more pronounced, there's a growing realization about the need to live sustainably. From reducing waste and conserving energy to supporting eco-friendly products, there are numerous ways we can make our daily lives more environmentally friendly. This post will explore practical tips and habits that can make a significant difference.",
  author: "Samuel Green",
  date: new Date("2023-08-10T09:15:00Z"),
});

const defaultPosts = [post1, post2, post3];

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//GET All posts
app.get("/posts", async (req: Request, res: Response) => {
  try {
    let posts = await Article.find({}).lean();
    if (!posts.length) {
      await Article.create(defaultPosts);
      posts = await Article.find({}).lean();
    }
    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "An unknown error has occurred.",
    });
  }
});

//GET a specific post by id
app.get("/posts/:id", async (req: Request, res: Response) => {
  try {
    const getID = req.params.id;
    const post = await Article.findOne({ _id: getID }).lean();
    if (!post) {
      throw new Error("Can't find the post with this ID.");
    }
    return res.status(200).json(post);
  } catch (error) {
    if (error instanceof URIError) {
      return res.status(400).json({ message: error.message });
    } else if (
      error instanceof Error &&
      error.message === "Can't find the post with this ID."
    ) {
      return res.status(404).json({ message: error.message });
    } else {
      return res.status(500).json({
        message:
          error instanceof Error
            ? error.message
            : "An unknown error has occurrred.",
      });
    }
  }
});

//POST a new post
app.post("/posts", async (req: Request, res: Response) => {
  try {
    if (!req.body.title || !req.body.content) {
      throw new Error("Title and content are required for a new post.");
    }
    const {
      title,
      content,
      author = "Anomynous",
    } = req.body as { title: string; content: string; author: string };
    const newPost = new Article({
      title,
      content,
      author,
    });
    await newPost.save();
    const savedNewPost = await Article.findOne({
      title: title,
      content: content,
      author: author,
    }).lean();
    return res.status(201).json(savedNewPost);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Title and content are required for a new post."
    ) {
      return res.status(400).json({ message: error.message });
    } else {
      return res.status(500).json({
        message:
          error instanceof Error
            ? error.message
            : "An unknown error has occurred.",
      });
    }
  }
});

//PATCH a post when you just want to update one parameter
app.patch("/posts/:id", async (req: Request, res: Response) => {
  try {
    const patchId = req.params.id;
    const patchPost = await Article.findOne({ _id: patchId });
    if (!patchPost) {
      throw new URIError(`Cannot find this post`);
    }

    const { title, content, author } = req.body as {
      title?: string;
      content?: string;
      author?: string;
    };

    patchPost.title = title || patchPost.title;
    patchPost.content = content || patchPost.content;
    patchPost.author = author || patchPost.author;
    patchPost.date = new Date();

    await patchPost.save();

    const updatedPost = await Article.findOne({ _id: patchId }).lean();
    return res.status(200).json(updatedPost);
  } catch (error) {
    if (error instanceof URIError) {
      return res.status(400).json({ message: error.message });
    } else {
      return res.status(500).json({
        message:
          error instanceof Error
            ? error.message
            : "An unknown error has occurred.",
      });
    }
  }
});

//DELETE a specific post by providing the post id.
app.delete("/posts/:id", async (req: Request, res: Response) => {
  try {
    const deleteId = req.params.id;
    const deletePost = await Article.deleteOne({ _id: deleteId });
    if (!deletePost.deletedCount) {
      throw new URIError(`Cannot find this post`);
    }
    return res.sendStatus(204);
  } catch (error) {
    if (error instanceof URIError) {
      return res.status(400).json({ message: error.message });
    } else {
      return res.status(500).json({
        message:
          error instanceof Error
            ? error.message
            : "An unknown error has occurred.",
      });
    }
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
