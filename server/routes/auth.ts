import express from "express";
import bcrypt from "bcryptjs";
import pool from "../db.js";

const router = express.Router();

type RegisterBody = {
    firstName?: unknown;
    lastName?: unknown;
    email?: unknown;
    password?: unknown;
};

router.post("/register", async function(request, response) {
    const body: RegisterBody = request.body ?? {};

    const {firstName, lastName, email, password} = body;

    if(
        typeof firstName !== "string" ||
        typeof lastName !== "string"  ||
        typeof email !== "string"     ||
        typeof password !== "string"
    ) {
        return response.status(400).json({
            message: "All fields must be provided as text."
        });
    }

    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    const cleanEmail = email.trim().toLowerCase();

    if(
        cleanFirstName.length < 1 || cleanFirstName.length > 50 ||
        cleanLastName.length < 1 || cleanLastName.length > 50
    ) {
        return response.status(400).json({
            message: "Names must contain between 1 and 50 characters."
        });
    }

    if(
        cleanEmail.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
    ) {
        return response.status(400).json({
            message: "Enter a valid email address."
        });
    }

    if(
        password.length < 8 ||
        Buffer.byteLength(password, "utf8") > 72
    ) {
        return response.status(400).json({
            message: "Password must have at least 8 characters and at most 72 bytes."
        });
    }

    try {
        const passwordHash = await bcrypt.hash(password, 12);

        const result = await pool.query<{id: number; email: string}>(
            `INSERT INTO public.users
                (first_name, last_name, email, password_hash)
             VALUES ($1, $2, $3, $4)
             RETURNING id, email`,
            [cleanFirstName, cleanLastName, cleanEmail, passwordHash]
        );

        return response.status(201).json({
            user: result.rows[0]
        });
    } catch(error) {
        if(error instanceof Error && "code" in error && error.code === "23505") {
            return response.status(409).json({
                message: "An account with this email already exists."
            });
        }

        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("Registration failed:", errorMessage);

        return response.status(500).json({
            message: "Registration failed."
        });
    }

});

type LoginBody = {
    email?: unknown;
    password?: unknown;
};

type LoginUser = {
    id: number;
    first_name: string;
    last_name: string;
    email:string;
    password_hash: string;
};

router.post("/login", async function(request, response) {
    const body: LoginBody = request.body ?? {};
    const {email, password} = body;

    if(typeof email !== "string" || typeof password !== "string") {
        return response.status(400).json({
            message: "Email and password must be provided as text."
        });
    }

    const cleanEmail = email.trim().toLowerCase();

    if(Buffer.byteLength(password, "utf8") > 72) {
        return response.status(401).json({
            message: "Invalid email or password."
        });
    }

    try{
        const result = await pool.query<LoginUser>(
            `SELECT id, first_name, last_name, email, password_hash
             FROM public.users
             WHERE email = $1`,
            [cleanEmail]
        );

        const user = result.rows[0];

        if(!user) {
            return response.status(401).json({
                message: "Invalid email or password."
            });
        }

        const passwordMatches = await bcrypt.compare(
            password,
            user.password_hash
        );

        if(!passwordMatches) {
            return response.status(401).json({
                message: "Invalid email or password."
            });
        }

        await new Promise<void>((resolve, reject) =>{
            request.session.regenerate(function(error: unknown){
                if(error){
                    reject(error);
                    return;
                }
                resolve();
            });
        });

        request.session.userId = user.id;

        await new Promise<void>((resolve, reject) => {
            request.session.save(function(error: unknown) {
                if(error){
                    reject(error);
                    return;
                }
                resolve();
            });
        });
        return response.status(200).json({
            user: {
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email
            }
        });
    } catch(error) {
        const errorMessage = error instanceof Error ? error.message: "Unknown error";

        console.error("Login failed:", errorMessage);
        return response.status(500).json({
            message: "Login failed."
        });
    }
});

router.post("/logout", function(request, response) {
    request.session.destroy(function(error: unknown) {
        if (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Unknown error";

            console.error("Logout failed:", errorMessage);

            return response.status(500).json({
                message: "Logout failed."
            });
        }

        response.clearCookie("moneymap.sid", {
            path: "/",
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production"
        });

        return response.status(204).end();
    });
});

export default router;

router.get("/me", async function(request, response) {
    const userId = request.session.userId;

    if (userId === undefined) {
        return response.status(401).json({
            message: "Not authenticated."
        });
    }

    try {
        const result = await pool.query<{
            id: number;
            first_name: string;
            last_name: string;
            email: string;
        }>(
            `SELECT id, first_name, last_name, email
             FROM public.users
             WHERE id = $1`,
            [userId]
        );

        const user = result.rows[0];

        if (!user) {
            return response.status(401).json({
                message: "Not authenticated."
            });
        }

        return response.status(200).json({
            user: {
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email
            }
        });
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";

        console.error("Loading current user failed:", errorMessage);

        return response.status(500).json({
            message: "Could not load the current user."
        });
    }
});