export class ApiError extends Error {
    readonly status: number;

    constructor(status: number, message: string) {
        super(message);

        this.name = "ApiError";
        this.status = status;
    }
}

export async function apiRequest(
    endpoint: string,
    options: RequestInit = {}
) : Promise<Response> {
    const headers = new Headers(options.headers);

    if(!headers.has("Accept")) {
        headers.set("Accept", "application/json");
    }

    const response = await fetch(endpoint, {
        ...options,
        headers,
        credentials: "include"
    });

    if(!response.ok){
        let message = `Request failed (${response.status}).`;

        try{
            const body: unknown = await response.json();

            if(typeof body === "object" && body !== null && "message" in body && typeof body.message === "string") {
                message = body.message;
            }
        } catch {
            message = `Request failed (${response.status}).`;
        }

        throw new ApiError(response.status, message);
    }
    return response;
}