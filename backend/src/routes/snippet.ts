import { Router } from "express";
import { createSnippet , getSnippetbyId } from "../controller/snippet";

const SnippetRouter = Router();

SnippetRouter.post("/create" , createSnippet);
SnippetRouter.get("/:id" , getSnippetbyId);

export default SnippetRouter ;