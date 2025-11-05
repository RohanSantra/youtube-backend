// --------------------------------------------------------------
// asyncHandler (Promise-based)
// --------------------------------------------------------------
// This function is a higher-order wrapper for asynchronous route handlers.
// In Express, when using async/await, if an error occurs (like a failed DB call),
// it may not be caught automatically — causing the app to crash.
//
// This asyncHandler automatically catches any rejected promises or thrown errors
// inside the route handler and passes them to Express's built-in error middleware
// using `next(err)`.
//
// It helps keep route code clean and removes the need for repetitive try-catch blocks.
//
// Example use:
// app.get("/user/:id", asyncHandler(async (req, res) => {
//     const user = await User.findById(req.params.id);
//     res.json(user);
// }));
//
// If an error happens in User.findById(), it will be forwarded to next(err).
// --------------------------------------------------------------

const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
            .catch(err => next(err))
    }
}

export default asyncHandler;



// --------------------------------------------------------------
// asyncHandler (Try–Catch-based)
// --------------------------------------------------------------
// This version of asyncHandler handles errors directly inside the function,
// without passing them to Express's global error middleware.
//
// It wraps the asynchronous route handler inside a try-catch block.
// If any error occurs, it sends a JSON response back to the client with
// the error message and HTTP status code.
//
// This is useful for small projects where we want to send custom error
// messages immediately without relying on centralized error handling.
//
// Example use:
// app.get("/user/:id", asyncHandler(async (req, res) => {
//     const user = await User.findById(req.params.id);
//     if (!user) throw { code: 404, message: "User not found" };
//     res.json(user);
// }));
//
// If an error occurs, it will respond directly with:
// { "message": "User not found", "success": false }
// -------------------------------------------------------------- 



// const asyncHnadler = (fn) = async (req, res, next) => {
//     try {
//         await fn(req, res, next);
//     } catch (error) {
//         res.status(err.code || 500).json({
//             message: err.message,
//             success: false
//         })
//     }
// }