"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSnippetbyId = exports.createSnippet = void 0;
const snippet_1 = __importDefault(require("../models/snippet"));
const createSnippet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { code, language } = req.body;
        const snippet = yield snippet_1.default.create({ code, language, createdBy: (_a = req.userId) !== null && _a !== void 0 ? _a : null });
        res.status(200).json({ snippet });
    }
    catch (error) {
        console.log(error);
    }
});
exports.createSnippet = createSnippet;
const getSnippetbyId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const snippet = yield snippet_1.default.findById(req.params.id);
        res.status(200).json({ snippet });
    }
    catch (error) {
        console.log(error);
    }
});
exports.getSnippetbyId = getSnippetbyId;
