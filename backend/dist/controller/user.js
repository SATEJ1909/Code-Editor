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
exports.signin = exports.signup = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = __importDefault(require("../models/user"));
const zod_1 = __importDefault(require("zod"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const config_1 = require("../config");
const requiredSchema = zod_1.default.object({
    username: zod_1.default.string().min(4).max(30),
    email: zod_1.default.string().email(),
    password: zod_1.default.string().min(4).max(30)
});
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!requiredSchema.safeParse(req.body).success) {
        return res.status(404).json({
            message: "Invalid Inputs"
        });
    }
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(404).json({
                message: "All Fields are necessary"
            });
        }
        const existingUser = yield user_1.default.findOne({ email });
        if (existingUser) {
            return res.status(404).json({
                message: "Email already exists"
            });
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const user = yield user_1.default.create({ username, email, password: hashedPassword });
        res.status(200).json({
            message: "User Created SuccessFully",
            user: user
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.signup = signup;
const signin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield user_1.default.findOne({ email });
        if (!user) {
            res.status(404).json({
                message: "Invalid email or password"
            });
        }
        //@ts-ignore 
        const isPasswordValid = yield bcrypt_1.default.compare(password, user === null || user === void 0 ? void 0 : user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: "Invalid  password" });
        }
        if (user) {
            const token = jsonwebtoken_1.default.sign({ id: user._id }, config_1.JWT_SECRET);
            res.status(201).json({
                token
            });
        }
        else {
            return res.status(400).json({ error: "Invalid email or password" });
        }
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.signin = signin;
