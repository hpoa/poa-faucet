const level = require('level');
const axios = require('axios');
const dateFormat = require('dateformat');
const app = require('../../index');

const db = level('slack-db');
const slackWebhook = app.config.Slack.webhook;

dateFormat.masks.dbtime = "dddd, mmmm dS, yyyy";

async function sendAmountNotifToSlackIfNotSent(balance) {
  let todayDate = dateFormat("dbtime");
  if (! await checkIfNotifAlredySent(todayDate)) {
    try {
      await sendSlackNotification(balance);
      await db.put("slack::latest", todayDate);
      await db.put(todayDate, balance);
    } catch (error) {
      console.log(error);
    }
  }
}

async function checkIfNotifAlredySent(todayDate) {
  try {
    let latestDateNotifSent = await db.get("slack::latest");
    return latestDateNotifSent === todayDate;
  } catch (error) {
    if (error.type === 'NotFoundError') {
      return false;
    }
    console.log(error.message);
  }
}

async function sendSlackNotification(balance) {
  axios.post(slackWebhook, {
    "text": `${balance} ${app.config.Slack.notifMessage}`
  })
  .then(function (response) {
    console.log(`Balance: ${balance} LETH, notification sent to slack.`);
  }).catch(function (error) {
    console.log(error.message);
  })
}

module.exports = { sendAmountNotifToSlackIfNotSent };
