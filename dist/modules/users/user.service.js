"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_model_1 = require("./user.model");
const getUserProfile = async (id) => {
    const user = await user_model_1.User.findById(id).select('-password');
    return user;
};
const getAllUsers = async () => {
    const users = await user_model_1.User.find().select('-password');
    return users;
};
exports.UserService = {
    getUserProfile,
    getAllUsers,
};
