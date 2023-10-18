const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const axios = require('axios');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// your facebook verification token
const VERIFY_TOKEN = '182002';
const PAGE_ACCESS_TOKEN = 'EAAZAAyAtQ8PABO0l5CKc0sqPLr5hqPqZAzcjAfxWw6m1SKraYRLmHZAJ50E9ZCg68USuUeZA5gZBEsE9spmi3U9KCZBWsxsGZAAzLZBpTmBEoKp4XKXdmy2gTbp9eB3kLTmiW6oU6Ux1EvRh2wItKZAMfpctNIeHJc0F3vvFCnoIUJ93pcVaPkFZCL1zLLsKfZB70TEA';

// fACEBOOK messanger API end points
// const FB_API_URL = 'https://graph.facebook.com/v11.0/me/messages?access_token=EAAZAAyAtQ8PABO6dhbP0lp8NvZCBYaZBdUkKCCHkt4ZAxACZBfikthWYPsUxzSiyn0sAc5rIuPWlZBiEbJ5wHzcfqz28noIj7XHfCQ3RmnZBnzcw45ggDZBdhfYGMvHDp9tWDLuN9WCZASZCMRGjFbu3n4OWZA0NdLQiU7x5mJ5Ui7opnRZA3DwkL1mg4xeqvtA81lZCr';

app.get('/webhook',(req,res)=>{

    if(req.query['hub.verify_token'] === VERIFY_TOKEN){
        res.send(req.query['hub.challenge']);
    }else{
        res.sendStatus(403);
    }

});

app.post('/webhook',(req,res)=>{
    const data = req.body;

    if(data.object === 'page'){
        data.entry.forEach(entry =>{
            const webhookEvent = entry.messaging[0];
            const senderId = webhookEvent.sender.id;
            // Handle incoming messages here
            // console.log(webhookEvent);
            if (webhookEvent.message) {
                handleMessage(senderId, webhookEvent.message);
              } else if (webhookEvent.postback) {
                handlePostback(senderId, webhookEvent.postback);
              }
        });
        res.sendStatus(200);
    }
});

// function handleMessage(senderId, message) {
//     const messageText = message.text;
  
//     // Implement custom logic here based on message content
//     if (messageText.toLowerCase() === 'hello') {
//       sendTextMessage(senderId, 'Hello! How can I assist you?');
//     } else if (messageText.toLowerCase() === 'help') {
//       sendTextMessage(senderId, 'Sure! What do you need help with?');
//     } else {
//       sendTextMessage(senderId, `You said: "${messageText}"`);
//     }
//   }

function handleMessage(senderId, message) {
  const messageText = message.text;

  // Load custom logic from the JSON file
  const customLogic = JSON.parse(fs.readFileSync('custom_logic.json', 'utf8'));

  // Check if the messageText is in the custom logic
  if (customLogic[messageText.toLowerCase()]) {
    sendTextMessage(senderId, customLogic[messageText.toLowerCase()]);
  } else {
    sendTextMessage(senderId, `You said: "${messageText}"`);
  }
}

  function sendTextMessage(senderId, text) {
    const messageData = {
      recipient: { id: senderId },
      message: { text }
    };
  
    callSendAPI(messageData);
  }

  function callSendAPI(messageData) {
    axios.post(`https://graph.facebook.com/v11.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, messageData)
      .then(response => {
        if (response.status === 200 && response.data.recipient_id) {
          console.log('Message sent successfully');
        } else {
          console.error('Unable to send message.');
        }
      })
      .catch(error => {
        console.error('Error sending message:', error);
      });
  }
  

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});