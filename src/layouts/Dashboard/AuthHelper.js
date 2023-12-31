import {
    Auth
  } from 'aws-amplify';
  
  class AuthHelper {
    static async refreshSessionPromise(refreshToken) {
      return new Promise(async (resolve, reject) => {
        const user = await Auth.currentAuthenticatedUser();
        return user.refreshSession(refreshToken, async (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data); // THIS IS YOUR REFRESHED ATTRIBUTES/GROUPS
          }
        });
      });
    }
    static async refreshCurrentSession() {
      const session = await Auth.currentSession();
      return this.refreshSessionPromise(session.getRefreshToken());
    }
  }
  
  export default AuthHelper;