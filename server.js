import express from 'express';
import bodyParser from 'body-parser';

import dotenv from 'dotenv';
import { handleMessage, handlePostback } from './fbmutils.js';

dotenv.config();
// create the app server
const app = express();

app.use(bodyParser.json());

// const corsOptions = {
//   origin: [`http://localhost:3000`],
// };

// app.use(cors(corsOptions));

app.post('/save-request', (req, res) => {
  console.log('Got the review:', req.body);
  // const reviewDoc = await Review.create({ text: req.body.text });
  // await reviewDoc.save()
  res.sendStatus(200);
});

app.get('/', (req, res, next) =>
  res.send('whats up this is an app made by kdawg')
);

app.post('/fbmwebhook', (req, res) => {
  const { body } = req;

  // Checks this is an event from a page subscription
  if (body.object === 'page') {
    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach((entry) => {
      const webhookEvent = entry.messaging[0];
      console.log(webhookEvent);

      // Get the sender PSID
      const senderPsid = webhookEvent.sender.id;
      console.log(`Sender PSID: ${senderPsid}`);

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhookEvent.message) {
        handleMessage(senderPsid, webhookEvent.message);
      } else if (webhookEvent.postback) {
        handlePostback(senderPsid, webhookEvent.postback);
      }
    });

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

app.get('/fbmwebhook', (req, res) => {
  const VERIFY_TOKEN = process.env.FBM_VERIFY_TOKEN;

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

app.listen({ port: process.env.PORT || 4000 }, () => {
  console.log(`up at http://localhost:${process.env.PORT || 4000}`);
});
