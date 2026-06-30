import express from "express";
import { Router } from "express";
import User from "../models/user.js";
import wrapAsync from "../utils/wrapAsync.js";
import passport from "passport";
import {saveRedirectUrl} from "../middleware.js";
import { login, logout, renderLoginForm,renderSignup, signup } from "../controllers/users.js"

const router=express.Router();

router.route("/signup")
    .get( renderSignup)
    .post( wrapAsync(signup));

router.route("/login")
    .get( renderLoginForm)
    .post( saveRedirectUrl, passport.authenticate("local", { failureRedirect: '/login', failureFlash: true }), login)

router.get("/logout", logout);

export default router;