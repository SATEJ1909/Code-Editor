
import { Request, Response } from "express";
import SnippetModel from "../models/snippet";

export const createSnippet = async (req: Request, res: Response) => {
    try {
        const { code, language } = req.body;
        const snippet = await SnippetModel.create({ code, language, createdBy: req.userId  ??  null});
        res.status(200).json({ snippet });

    } catch (error) {
        console.log(error);
    }
};

export const getSnippetbyId = async (req: Request, res: Response) => {
    try {
        const snippet = await SnippetModel.findById(req.params.id);
        res.status(200).json({ snippet });
    } catch (error) {
        console.log(error);
    }
}
