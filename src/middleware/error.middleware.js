import { ZodError } from "zod";

export const errorHandler = (err, req, res, next) => {

    // Zod Validation Error
    if (err instanceof ZodError || err.name === "ZodError") {

        return res.status(400).json({

            success: false,

            message: "Validation failed",

            errors: err.issues.map(issue => ({

                field: issue.path.join("."),

                message: issue.message

            }))

        });

    }

    // Custom App Error
    if (err.statusCode) {

        return res.status(err.statusCode).json({

            success: false,

            message: err.message,

            errors: err.errors || []

        });

    }

    // Unknown Error
    console.error(err);

    return res.status(500).json({

        success: false,

        message: "Internal Server Error",

        errors: []

    });

};