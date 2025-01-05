import { prisma } from '../../config/config.js';
import passport from 'passport';
import { Strategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import bcrypt from 'bcrypt';
import { errorResponse, uploadImage } from '../util/util.js';

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await prisma.account.findUnique({
    where: { id: id },
  });
  if (!user) {
    done(null, false);
  } else {
    done(null, user);
  }
});

passport.use(
  new Strategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const user = await prisma.account.findUnique({
        where: { email },
      });

      // If user is found and had logged in with local strategy
      if (user && user.password) {
        if (user.is_lock) {
          return done(null, false, {
            message: 'Tài khoản đã bị khóa',
          });
        }
        if (!user.is_admin) {
          return done(null, false, {
            message: 'Tài khoản không có quyền truy cập',
          });
        }
        const match = await bcrypt.compare(password, user.password);
        if (match) {
          return done(null, user);
        }
      }

      return done(null, false, {
        message: 'Sai email hoặc mật khẩu',
      });
    } catch (err) {
      return done(err);
    }
  }),
);

// Google OAuth2.0
export default passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URI,
      state: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      const { id, displayName, emails, photos } = profile;
      const email = emails[0].value;
      let avatar = photos[0].value;

      // Check if the user exists with the given email
      let user = await prisma.account.findUnique({
        where: {
          email: email,
        },
      });

      if (!user) {
        return done(null, false, {
          message: 'Tài khoản không tồn tại',
        });
      } else {
        if (user.is_lock) {
          return done(null, false, {
            message: 'Tài khoản đã bị khóa',
          });
        }
        if (!user.is_admin) {
          return done(null, false, {
            message: 'Tài khoản không có quyền truy cập',
          });
        }
      }

      return done(null, user);
    },
  ),
);

// Authorize for calling api
export function authorize(req, res, next) {
  if (!req.user) {
    return res
      .status(401)
      .send(errorResponse(401, 'Bạn cần đăng nhập để thực hiện hành động này'));
  }
  if (req.user.is_lock) {
    return res.status(403).send(errorResponse(401, 'Tài khoản đã bị khóa'));
  }
  if (!req.user.is_admin) {
    return res
      .status(403)
      .send(errorResponse(401, 'Tài khoản không có quyền truy cập'));
  }
  return next();
}

export function forbidRoute(req, res, next) {
  const isLoggedIn = !!req.user;
  const isLogout = req.path.includes('/logout');

  // Logged in but accessing something other than '/logout'
  // Or not logged in but accessing '/logout'
  if ((isLoggedIn && !isLogout) || (!isLoggedIn && isLogout)) {
    return res
      .status(403)
      .send(errorResponse(403, 'Không thể thực hiện hành động này'));
  }
  return next();
}
