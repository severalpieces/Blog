import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import axios from "axios";
import path from "path";

const app = express();
const port = 3000;
const API_URL = "http://localhost:4000";

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Route to render the main page
app.get("/", async (req: Request, res: Response) => {
  try {
    const response = await axios.get(API_URL + "/posts");
    return res.render("index", { posts: response.data });
  } catch (error) {
    let errorMessage = "Error fetching posts";
    let statusCode = 404;
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || errorMessage;
      statusCode = error.response?.status || statusCode;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return res.status(statusCode).json({ message: errorMessage });
  }
});

// Route to render the edit page
app.get("/edit/:id", async (req: Request, res: Response) => {
  const editID = req.params.id;
  try {
    const response = await axios.get(API_URL + `/posts/${editID}`);
    return res.render("edit", {
      post: response.data,
      heading: "Edit Post",
      submit: "Update Post",
    });
  } catch (error) {
    let errorMessage = `Error fetching post`;
    let statusCode = 404;
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || errorMessage;
      statusCode = error.response?.status || statusCode;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    return res.status(statusCode).json({ message: errorMessage });
  }
});

// Create a new post
app.get("/new", async (req: Request, res: Response) => {
  try {
    return res.render("edit", {
      heading: "New Post",
      submit: "Create Post",
    });
  } catch (error) {
    return res.status(404).json({
      message:
        error instanceof Error
          ? error.message
          : "Error rendering new-post page",
    });
  }
});

app.post("/new", async (req: Request, res: Response) => {
  try {
    await axios.post(`${API_URL}/posts`, req.body);
    return res.status(201).redirect("/");
  } catch (error) {
    let errorMessage = "Error creating new post";
    let statusCode = 404;
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || errorMessage;
      statusCode = error.response?.status || statusCode;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    return res.status(statusCode).json({ message: errorMessage });
  }
});

// Partially update a post
app.post("/edit/:id", async (req: Request, res: Response) => {
  const editID = req.params.id;
  try {
    await axios.patch(`${API_URL}/posts/${editID}`, req.body);
    return res.status(200).redirect("/");
  } catch (error) {
    let errorMessage = "Error updating post";
    let statusCode = 404;
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || errorMessage;
      statusCode = error.response?.status || statusCode;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    return res.status(statusCode).json({ message: errorMessage });
  }
});

// Delete a post
app.get("/delete/:id", async (req: Request, res: Response) => {
  const deleteID = req.params.id;
  try {
    await axios.delete(`${API_URL}/posts/${deleteID}`);
    return res.status(204).redirect("/");
  } catch (error) {
    let errorMessage = "Error deleting post";
    let statusCode = 404;
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || errorMessage;
      statusCode = error.response?.status || statusCode;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    return res.status(statusCode).json({ message: errorMessage });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
