import dotenv from 'dotenv'
import app from './app.js';
import connectdb from './db/index.js';

dotenv.config({
    path: './.env'
});

const port = process.env.PORT || 8000;




connectdb()
    .then(() => {
        app.on("error", (error) => {
            console.log("ERRR: ", error);
            throw error
        })
        app.listen(port, () => {
            console.log("Server is listening on port :", port);

        })
    })
    .catch((error) => {
        console.log("Mongo db connection failed :", error);
    })



/*
If i want to do Database connection directly in index .js

( async () => {
try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    app.on("errror", (error) => {
        console.log("ERRR: ", error);
        throw error
    })

    app.listen(process.env.PORT, () => {
        console.log(`App is listening on port ${process.env.PORT}`);
    })

} catch (error) {
    console.error("ERROR: ", error)
    throw err
}
})()

*/