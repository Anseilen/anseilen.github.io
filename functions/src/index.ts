import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
const app = express();


// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

const authenticate = async (req: any, res: any, next: any) => {
  if(!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
    res.status(403).send('Unauthoried');
    return;
  }
  const idToken = req.headers.authorization.aplit('Bearer ')[1];
  try {
    const decodedIdToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedIdToken;
    next();
    return;
  } catch(e) {
    res.status(403).send('Unauthorized');
    return;
  }
};

app.use(authenticate);

// GET /api/coin
app.get('/coin',async (req: any, res) => {
  let query = admin.firestore().doc(`/users/${req.user.uid}`);
  const userData = await query.get();
  const coin = userData.get("coin");
  
  res.status(200).json({coin: coin});
});

exports.api = functions.https.onRequest(app);
