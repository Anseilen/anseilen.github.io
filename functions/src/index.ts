import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp();
import * as express from 'express';
const cors = require('cors');
const app = express();

app.use(cors({origin: true}));

const authenticate = async (req: any, res: any, next: any) => {
  if(!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
    res.status(403).send('Unauthoried');
    return;
  }
  const idToken = req.headers.authorization.split('Bearer ')[1];
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
app.get('/api/coin',async (req: any, res) => {
  let query = admin.firestore().doc(`/users/${req.user.uid}`);
  const userData = await query.get();
  const coin = userData.get("coin");
  
  return res.status(200).json({coin: coin});
});

// POST /api/register
app.post('/api/register', async (req: any, res) => {
  const id = req.user.uid;
  const email = req.body.email;
  const phone = req.body.phone;
  const gender = req.body.gender;
  const funnel = req.body.funnel;
  console.log(id, phone, gender, funnel);
  if(!id || !email || !phone || !gender || !funnel ) return res.sendStatus(400);
  return admin.firestore().doc(`/profiles/${id}`).set({
    email: email,
    phone: phone,
    gender: gender,
    funnel: funnel
  })
  .then(() => {
    return res.sendStatus(201);
  })
  .catch((error) => {
    functions.logger.error(new Error(error))
    return res.sendStatus(500)
  })
})

exports.api = functions.https.onRequest(app);
