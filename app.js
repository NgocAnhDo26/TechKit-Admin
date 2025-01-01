import express from 'express';
import path from 'path';
import router from './src/routes/index.js';
import morgan from 'morgan';
// import session from 'express-session';
// import cookieParser from 'cookie-parser';
// import passport from 'passport';
// import { getUrl } from './src/account/accountService.js';

const app = express();
const __dirname = import.meta.dirname;

// Init middlewares
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// app.use(express.urlencoded({ extended: false })); // Parse URL-encoded bodies
// app.use(express.json()); // Parse JSON bodies
// app.use(cookieParser(JSON.parse(process.env.SECRET)));
app.use(express.static(path.join(__dirname, 'public'))); // Use static files
// app.use(
//     session({
//         secret: JSON.parse(process.env.SECRET),
//         resave: false,
//         saveUninitialized: false,
//         cookie: {
//             maxAge: 60000 * 60,
//         },
//     }),
// );

// app.use(passport.initialize());
// app.use(passport.session());
app.use(morgan('dev'));

// Set local variables to use in all view engine templates
// app.use((req, res, next) => {
//     res.locals.isAuth = req.user ? true : false;
//     res.locals.avatar = req.user ? getUrl(req.user.avatar) : '';
//     next();
// });

app.use(router); // Init routes

// Handing errors
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT ?? 1111; // Server setup

const server = app.listen(PORT, () => {
    console.log(`TechKit starts at port http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
    server.close(() => {
        console.log('Exit Server Express');
    });
});

export default app;