import request from 'request';

export const callSendAPI = (sender_psid, response) => {
  // Construct the message body
  const reqBody = {
    recipient: {
      id: sender_psid,
    },
    message: response,
  };

  // Send the HTTP request to the Messenger Platform
  request(
    {
      uri: 'https://graph.facebook.com/v2.6/me/messages',
      qs: { access_token: process.env.FBM_ACCESS_TOKEN_SECRET },
      method: 'POST',
      json: reqBody,
    },
    (err, res, body) => {
      if (res.statusCode != 200) {
        console.log('err: ', res.statusCode);
        console.log(res);
      } else if (!err) {
        console.log('message sent!');
      } else {
        console.error(`Unable to send message:${err}`);
      }
    }
  );
};

export const handleMessage = (sender_psid, received_message) => {
  let response;

  // Checks if the message contains text
  if (received_message.text) {
    // Create the payload for a basic text message, which
    // will be added to the body of our request to the Send API
    response = {
      text: `You sent the message: "${received_message.text}". Now send me an attachment!`,
    };
  } else if (received_message.attachments) {
    // Get the URL of the message attachment
    const attachmentUrl = received_message.attachments[0].payload.url;
    response = {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: [
            {
              title: 'This was a test',
              subtitle:
                'Would you like to save your contact info on our servers?.',
              image_url: attachmentUrl,
              buttons: [
                {
                  type: 'postback',
                  title: 'Yes!',
                  payload: 'yes',
                },
                {
                  type: 'postback',
                  title: 'No!',
                  payload: 'no',
                },
              ],
            },
          ],
        },
      },
    };
  }

  // Send the response message
  callSendAPI(sender_psid, response);
};

export const handlePostback = (sender_psid, received_postback) => {
  let response;

  // Get the payload for the postback
  const { payload } = received_postback;

  // Set the response based on the postback payload
  if (payload === 'yes') {
    response = {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'button',
          text: 'Try the URL button!',
          buttons: [
            {
              type: 'web_url',
              url: 'https://www.messenger.com/',
              title: 'URL Button',
              webview_height_ratio: 'full',
            },
          ],
        },
      },
    };
  } else if (payload === 'no') {
    response = { text: 'Alright no worries.' };
  }
  // Send the message to acknowledge the postback
  callSendAPI(sender_psid, response);
};
