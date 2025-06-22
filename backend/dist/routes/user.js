"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_1 = require("../controller/user");
const UserRouter = (0, express_1.Router)();
//@ts-ignore
UserRouter.post("/signup", user_1.signup);
//@ts-ignore
UserRouter.post("/signin", user_1.signin);
exports.default = UserRouter;
