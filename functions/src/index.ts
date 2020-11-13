import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';
admin.initializeApp();
import * as express from 'express';
const cors = require('cors');
const generalApp = express();
const paymentsApp = express();

generalApp.use(cors({origin: true}));
paymentsApp.use(cors({origin: true}));

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

generalApp.use(authenticate);
paymentsApp.use(authenticate);

// GET /api/coin
generalApp.get('/api/coin',async (req: any, res) => {
  const query = admin.firestore().doc(`/users/${req.user.uid}`);
  const userData = await query.get();
  const coin = userData.get("coin");
  
  return res.status(200).json({coin: coin});
});
// POST /api/register
generalApp.post('/api/register', async (req: any, res) => {
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

// GET /api/charges
generalApp.get('/api/charges', async (req: any, res) => {
  const id = req.user.uid;
  let lastVisible = req.query.last ? req.query.last : "";
  const size = 10;
  type item = { id:string, date: any; coin: any; amount: any; cancelled: any; };
  type resultType = {
    url: string,
    items: item[]
  }
  let result : resultType = {
    url: '',
    items: [],
  }
  let items: item[] = [];
  let itemSize = 0;

  if (!lastVisible) {
    const next = admin.firestore().collection(`/users/${id}/charges`).orderBy("chargedTime", "desc").limit(size);
    await next.get().then((documentSnapshots) => {
      itemSize = documentSnapshots.docs.length;
      if(itemSize){
        lastVisible = documentSnapshots.docs[itemSize-1].id;
      }
      documentSnapshots.forEach(doc => {
        items.push({
          id: doc.id,
          date: doc.get("chargedTime").toDate(),
          coin: doc.get("chargedCoin"),
          amount: doc.get("amount"),
          cancelled: doc.get("cancelledCoin"),
        })
      })
    })
  } else {
    const lastVisibleDoc = await admin.firestore().doc(`/users/${id}/charges/${lastVisible}`).get();
    if(!lastVisibleDoc.exists) return res.status(404).send("document not found.");

    const next = admin.firestore().collection(`/users/${id}/charges`).orderBy("chargedTime", "desc").startAfter(lastVisibleDoc).limit(size);
    await next.get().then((documentSnapshots) => {
      itemSize = documentSnapshots.docs.length
      if(itemSize){
        lastVisible = documentSnapshots.docs[itemSize-1].id;
      }
      documentSnapshots.forEach(doc => {
        items.push({
          id: doc.id,
          date: doc.get("chargedTime").toDate(),
          coin: doc.get("chargedCoin"),
          amount: doc.get("amount"),
          cancelled: doc.get("cancelledCoin")
        })
      })
    })
  }

  result.url = `/api/charges?lastVisible=${lastVisible}&size=${itemSize}`
  result.items = items

  return res.status(200).send(result);
})
// GET /api/usages
generalApp.get('/api/usages', async(req: any, res) => {
  const id = req.user.uid;
  let lastVisible = req.query.last ? req.query.last : "";
  const size = 10;
  type item = {id:string, requestDate: any, endDate: any, name: string, status: string};
  type resultType = {
    url: string,
    items: item[],
  }
  let result : resultType = {
    url: '',
    items: [],
  }
  let items: item[] = [];
  let itemSize = 0;

  if (!lastVisible) {
    const next = admin.firestore().collection(`/users/${id}/stts`).where("state", "in", ["Succeeded", "Running", "Ready"]).orderBy("requestTime", "desc").limit(size);
    await next.get().then((documentSnapshots) => {
      itemSize = documentSnapshots.docs.length;
      if(itemSize){
        lastVisible = documentSnapshots.docs[itemSize-1].id;
      }
      documentSnapshots.forEach(doc => {
        const raw_id = doc.get("initAudioPath") ? doc.get("initAudioPath").split(/[/,\\]/).pop() : doc.get("sttUid")
        items.push({
          id: doc.id,
          requestDate: doc.get("requestTime").toDate(),
          endDate: doc.get("endTime") ? doc.get("endTime").toDate() : "",
          name: raw_id,
          status: doc.get("state"),
        });
      });
    })
  } else {
    const lastVisibleDoc = await admin.firestore().doc(`/users/${id}/stts/${lastVisible}`).get();
    if(!lastVisibleDoc.exists) return res.status(404).send("document not found");

    const next = admin.firestore().collection(`/users/${id}/stts`)
      .where("state", "in", ["Succeeded", "Running", "Ready"])
      .orderBy("requestTime", "desc")
      .startAfter(lastVisibleDoc)
      .limit(size);
    await next.get().then((documentSnapshots) => {
      itemSize = documentSnapshots.docs.length
      if(itemSize) {
        lastVisible = documentSnapshots.docs[itemSize-1].id;
      }
      documentSnapshots.forEach(doc => {
        const raw_id = doc.get("initAudioPath") ? doc.get("initAudioPath").split(/[/,\\]/).pop() : doc.get("sttUid").slice(0,8)
        items.push({
          id: doc.id,
          requestDate: doc.get("requestTime").toDate(),
          endDate: doc.get("endTime") ? doc.get("endTime").toDate() : "",
          name: raw_id,
          status: doc.get("state"),
        });
      });
    });
  }
  result.url = `/api/usages?lastVisible=${lastVisible}&size=${itemSize}`;
  result.items = items;

  return res.status(200).send(result);
})

//POST /payments/request
paymentsApp.post('/payments/request', async (req:any, res) => {
  const id = req.user.uid;
  const merchant_uid = req.body.merchant_uid;
  const amount = req.body.amount;

  if (!id || !merchant_uid || !amount) return res.sendStatus(400);
  await admin.firestore().doc(`/users/${id}/charges/${merchant_uid}`).set({
    requestTime: admin.firestore.FieldValue.serverTimestamp(),
    amount: amount,
    status: "request",
  })
  return admin.firestore().doc(`/merchants/${merchant_uid}`).set({
    userUid: id
  })
  .then(() => {
    return res.sendStatus(201);
  })
  .catch((error) => {
    functions.logger.error(new Error(error))
    return res.sendStatus(500)
  })
})
// POST /payments/complete
paymentsApp.post('/payments/complete', async (req:any, res) => {
  const id = req.user.uid;
  const imp_uid = req.body.imp_uid;
  const merchant_uid = req.body.merchant_uid;
  console.log(id, imp_uid, merchant_uid)
  if (!id || !imp_uid || !merchant_uid) return res.sendStatus(400);
  try {
    const getToken = await axios({
      url: "https://api.iamport.kr/users/getToken",
      method: "post",
      headers: { "Content-Type": "application/json" },
      data: {
        imp_key: functions.config().iamport.imp_key,
        imp_secret: functions.config().iamport.imp_secret,
      }
    })
    const { access_token } = getToken.data.response;
  
    const getPaymentData = await axios({
      url: `https://api.iamport.kr/payments/${imp_uid}`,
      method: "get",
      headers: { "Authorization": access_token }
    });
  
    const paymentData = getPaymentData.data.response;

    const orderDoc = admin.firestore().doc(`/users/${id}/charges/${merchant_uid}`);
    const userDoc = admin.firestore().doc(`/users/${id}`)
    const orderData = await orderDoc.get();
    const amountToBePaid = orderData.get("amount");
    const { amount, status } = paymentData;

    if(+amount === +amountToBePaid) {
      //Transaction section(coin update)
      await admin.firestore().runTransaction(async (t) => {
        const t_orderDoc = await t.get(orderDoc);
        if(t_orderDoc.get("status") === "request") {
          const t_userDoc = await t.get(userDoc);
          const currentCoin = t_userDoc.get("coin");
          const chargeCoin = Math.floor(amount / Number(functions.config().iamport.price));
          let updatedCoin = Number(currentCoin) +  chargeCoin;
          t.update(userDoc, {
            coin: updatedCoin,
          })
          t.update(orderDoc, {
            "paymentData": paymentData,
            "status": "success",
            "chargedCoin": chargeCoin,
            "chargedCurrentCoin": currentCoin,
            "chargedUpdateCoin": updatedCoin,
            "chargedTime": admin.firestore.FieldValue.serverTimestamp(),
          })
        }
      })
      .catch((error) => {
        functions.logger.error(Error(`Transacrion Error ${error}`))
      })
      switch(status) {
        case "paid":
          res.send({status: "success", message: "일반 결제 성공"});
          break;
      } 
    }else {
      throw { status: "forgery", message: "위조된 결제시도"};
    }
  } catch(e) {
    functions.logger.error(new Error(e))
    return res.status(400).send(e);
  }
  return;
})

exports.api = functions.https.onRequest(generalApp);
exports.payments = functions.https.onRequest(paymentsApp);


exports.iamportWebhook = functions.https.onRequest( async (req, res: any) => {
  try{
    const { imp_uid, merchant_uid, status } = req.body;

    const merchantData = await admin.firestore().doc(`/merchants/${merchant_uid}`).get()
    const userUid = merchantData.get('userUid');
    const userDoc = admin.firestore().doc(`/users/${userUid}`)
    const chargeDoc = admin.firestore().doc(`/users/${userUid}/charges/${merchant_uid}`)

    const getToken = await axios({
      url: "https://api.iamport.kr/users/getToken",
      method: "post",
      headers: { "Content-Type": "application/json" },
      data: {
        imp_key: functions.config().iamport.imp_key,
        imp_secret: functions.config().iamport.imp_secret,
      }
    })
    const { access_token } = getToken.data.response;
  
    const getPaymentData = await axios({
      url: `https://api.iamport.kr/payments/${imp_uid}`,
      method: "get",
      headers: { "Authorization": access_token }
    });

    const paymentData = getPaymentData.data.response;

    if(status === "cancelled") {
      const { cancel_amount } = paymentData
      // payment cancelled
      await admin.firestore().runTransaction( async (t) => {
        const t_userDoc = await t.get(userDoc);
        const t_chargedDoc = await t.get(chargeDoc)
        const cancelledCoin = Math.floor(cancel_amount / Number(functions.config().iamport.price));
        const currentCoin = t_userDoc.get("coin");
        const currentStatus = t_chargedDoc.get("status");
        let updatedCoin = currentCoin - cancelledCoin;
        updatedCoin = updatedCoin < 0 ? 0 : updatedCoin; 

        const cancelledDoc = {
          "originCancelledCoin": cancelledCoin,
          "cancelledAmount": cancel_amount,
          "cancelledCurrentCoin": currentCoin,
          "appliedCancelledCoin": cancelledCoin,
          "cancelledUpdatedCoin": updatedCoin,
        }

        if(currentStatus === "cancelled") {
          const alreadyCancelledCoin = t_chargedDoc.get("cancelledCoin");
          const appliedCancelledCoin = cancelledCoin - alreadyCancelledCoin;
          updatedCoin = currentCoin - appliedCancelledCoin;
          updatedCoin = updatedCoin < 0 ? 0 : updatedCoin;
          cancelledDoc.appliedCancelledCoin = appliedCancelledCoin;
          cancelledDoc.cancelledUpdatedCoin = updatedCoin;

          t.update(chargeDoc, {
            "status": "cancelled",
            "cancelledCoin": cancelledCoin,
            "cancelledList": admin.firestore.FieldValue.arrayUnion(cancelledDoc)
          })
        } else {
          t.update(chargeDoc, {
            "status": "cancelled",
            "cancelledCoin": cancelledCoin,
            "latestCancelledTime": admin.firestore.FieldValue.serverTimestamp(),
            "cancelledList": [ cancelledDoc ]
          })
        }
          t.update(userDoc, {
            coin: updatedCoin,
          });
      })
      res.status(200).send("cancelled updated")

    } else if(status === "paid") {
      const { amount } = paymentData;
      const isUpdate = await admin.firestore().runTransaction(async (t) => {
        const t_chargedDoc = await t.get(chargeDoc)
        if(t_chargedDoc.get("status") === "request"){
          const t_userDoc = await t.get(userDoc);
          const currentCoin = t_userDoc.get("coin");
          const chargeCoin = Math.floor(amount / Number(functions.config().iamport.price));
          let updatedCoin = Number(currentCoin) +  chargeCoin;
          t.update(userDoc, {
            "coin": updatedCoin,
          })
          t.update(chargeDoc, {
            "paymentData": paymentData,
            "status": "success",
            "chargedCoin": chargeCoin,
            "chargedCurrentCoin": currentCoin,
            "chargedUpdatedCoin": updatedCoin,
            "chargedTime": admin.firestore.FieldValue.serverTimestamp(),
          })
          return Promise.resolve("update")
        } else {
          return Promise.resolve("not-update")
        }
      })
      
      if(isUpdate === "update") {
        res.status(200).send("updated")
      } else if(isUpdate === "not-update") {
        res.status(200).send("not-updated")
      } 

      res.status(500).send(isUpdate)
    } else {
      res.status(500).send({status: status, msg: "this is not intended"})
    }
  } catch(e) {
    functions.logger.error(new Error(e))
    return res.status(400).send(e);
  }
  return;
})
