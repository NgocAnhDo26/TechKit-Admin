import { prisma } from '../config/config.js'; // Import prisma database connection
import passport from 'passport';
import { Strategy } from 'passport-local';
import bcrypt from 'bcrypt';

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

export default passport.use(
    new Strategy({ usernameField: 'email' }, async (email, password, done) => {
        try {
            const user = await prisma.account.findUnique({
                where: { email: email },
            });

            if (user) {
                const match = await bcrypt.compare(password, user.password);
                if (match) {
                    return done(null, user);
                }
            }

            return done(null, false, {
                message: 'Incorrect email or password.',
            });
        } catch (err) {
            done(err);
        }
    }),
);