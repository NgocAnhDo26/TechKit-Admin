import express from 'express';
import path from 'path';
import router from './src/routes/index.js';
import session from 'express-session';
import { RedisStore } from 'connect-redis';
import { redisClient } from './src/config/config.js';
import passport from 'passport';
import { errorResponse, getUrl } from './src/components/util/util.js';

const app = express();
const __dirname = import.meta.dirname;

// Init middlewares
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

app.use(express.urlencoded({ extended: false })); // Parse URL-encoded bodies
app.use(express.json()); // Parse JSON bodies
app.use(express.static(path.join(__dirname, 'public'))); // Use static files
app.use(
  session({
    store: new RedisStore({ client: redisClient, ttl: 86400 }), // Store session in memory in 1 day using redis
    secret: JSON.parse(process.env.SECRET),
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 60000 * 60, // Cookie live for 1 hour
    },
  }),
);
app.use(passport.initialize());
app.use(passport.session());

// Change the order - move auth check before setting locals
app.use((req, res, next) => {
  if (!req.user && req.path !== '/' && !req.path.startsWith('/auth')) {
    return res.redirect('/');
  }
  next();
});

// Set local variables to use in all view engine templates
app.use(async (req, res, next) => {
  res.locals.isAuth = req.user ? true : false;
  res.locals.avatar = req.user ? getUrl(req.user.avatar) : '';
  next();
});

app.use(router); // Init routes

// Handing errors
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send(errorResponse(500, 'Xin lỗi, có lỗi xảy ra'));
});

const PORT = process.env.PORT ?? 2000; // Server setup

const server = app.listen(PORT, () => {
  console.log(`TechKit starts at port http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
  server.close(() => {
    console.log('Exit Server Express');
  });
});

export default app;
