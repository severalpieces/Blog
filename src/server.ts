import express, { Request, Response } from "express";
import bodyParser, { urlencoded } from "body-parser";

const app = express();
const port = 4000;

export type Post = {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
};

// In-memory data store
let posts: Post[] = [
  {
    id: 1,
    title: "The Rise of Decentralized Finance",
    content:
      "Decentralized Finance (DeFi) is an emerging and rapidly evolving field in the blockchain industry. It refers to the shift from traditional, centralized financial systems to peer-to-peer finance enabled by decentralized technologies built on Ethereum and other blockchains. With the promise of reduced dependency on the traditional banking sector, DeFi platforms offer a wide range of services, from lending and borrowing to insurance and trading.",
    author: "Alex Thompson",
    date: "2023-08-01T10:00:00Z",
  },
  {
    id: 2,
    title: "The Impact of Artificial Intelligence on Modern Businesses",
    content:
      "Artificial Intelligence (AI) is no longer a concept of the future. It's very much a part of our present, reshaping industries and enhancing the capabilities of existing systems. From automating routine tasks to offering intelligent insights, AI is proving to be a boon for businesses. With advancements in machine learning and deep learning, businesses can now address previously insurmountable problems and tap into new opportunities.",
    author: "Mia Williams",
    date: "2023-08-05T14:30:00Z",
  },
  {
    id: 3,
    title: "Sustainable Living: Tips for an Eco-Friendly Lifestyle",
    content:
      "Sustainability is more than just a buzzword; it's a way of life. As the effects of climate change become more pronounced, there's a growing realization about the need to live sustainably. From reducing waste and conserving energy to supporting eco-friendly products, there are numerous ways we can make our daily lives more environmentally friendly. This post will explore practical tips and habits that can make a significant difference.",
    author: "Samuel Green",
    date: "2023-08-10T09:15:00Z",
  },
];

let lastId = 3;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Write your code here//

//GET All posts
app.get("/posts", (req: Request, res: Response) => {
  try {
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
app.get("/posts/:id", (req: Request, res: Response) => {
  try {
    const getID = parseInt(req.params.id);
    if (isNaN(getID)) {
      throw new URIError("ID has to be a number.");
    }
    const post = posts.find((post) => post.id === getID);
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
app.post("/posts", (req: Request, res: Response) => {
  try {
    if (!req.body.title || !req.body.content) {
      throw new Error("Title and content are required for a new post.");
    }
    const {
      title,
      content,
      author = "Anomynous",
    } = req.body as { title: string; content: string; author: string };
    const newPost: Post = {
      id: lastId + 1,
      title,
      content,
      author,
      date: new Date().toISOString(),
    };
    lastId++;
    posts.push(newPost);
    return res.status(201).json(newPost);
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
app.patch("/posts/:id", (req: Request, res: Response) => {
  try {
    const patchId = parseInt(req.params.id);
    if (isNaN(patchId)) {
      throw new URIError("ID of a post should be a number.");
    }

    const index = posts.findIndex((post) => post.id === patchId);
    if (index === -1) {
      throw new URIError(`Cannot find post with id ${patchId}.`);
    }

    const { title, content, author } = req.body as {
      title?: string;
      content?: string;
      author?: string;
    };
    posts[index] = {
      ...posts[index],
      title: title || posts[index].title,
      content: content || posts[index].content,
      author: author || posts[index].author,
      date: new Date().toISOString(),
    };
    return res.status(200).json(posts[index]);
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
app.delete("/posts/:id", (req: Request, res: Response) => {
  try {
    const deleteId = parseInt(req.params.id);
    if (isNaN(deleteId)) {
      throw new URIError("ID of a post must be a number.");
    }

    const index = posts.findIndex((post) => post.id === deleteId);
    if (index === -1) {
      throw new URIError(`Cannot find post with ID ${deleteId}.`);
    }

    posts.splice(index, 1);
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
