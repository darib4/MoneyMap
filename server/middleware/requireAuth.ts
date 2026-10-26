import type {
    Request,
    Response,
    NextFunction
} from "express";

export default function requireAuth(
    request: Request,
    response: Response,
    next: NextFunction
): void {
    if (request.session.userId === undefined) {
        response.status(401).json({
            message: "Not authenticated."
        });

        return;
    }

    next();
}
