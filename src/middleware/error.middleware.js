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

    // Prisma Foreign Key & Constraint Error Handling
    if (err.code === "P2003") {
        return res.status(400).json({
            success: false,
            message: `Invalid reference ID provided. ${err.meta && err.meta.field_name ? err.meta.field_name : "Foreign key constraint failed."}`,
            errors: []
        });
    }

    if (err.code === "P2002") {
        return res.status(409).json({
            success: false,
            message: `Unique constraint failed on field(s): ${err.meta && err.meta.target ? err.meta.target.join(", ") : "duplicate value"}`,
            errors: []
        });
    }

    if (err.code === "P2025") {
        return res.status(404).json({
            success: false,
            message: err.meta && err.meta.cause ? err.meta.cause : "Record to update/delete not found.",
            errors: []
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