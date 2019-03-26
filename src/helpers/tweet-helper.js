const scrape = require('page-scraper');
const level = require('level');
const stringSimilarity = require('string-similarity');

// similarity constants
const referenceString = "Lisinski Faucet Ether Lisinski Testnet PIPA pipa https://lisinski.online/en";
const similarityTreshold = 0.2;

const db = level('tweet-db');

async function checkIfValidTweet (tweetUrl) {
  const response = {valid: false, message: ""};
  if (await isNewTweet(tweetUrl)) {
    const tweetContent = scrapeTweetContent(tweetUrl);
    if (tweetContent.length === 0) {
      const similarity = stringSimilarity.compareTwoStrings(tweetContent, referenceString);
      if (similarity >= similarityTreshold) {
        await db.put(tweetUrl, tweetContent);
        response.valid = true;
      } else {
        response.message = 'Tweet content is not valid, Lisinski Testnet must be mentioned in Tweet!';
      }
    } else {
      response.message = 'Tweet url is not valid!';
    }
  } else {
    response.message = 'This tweet already used for claiming LETH reward!';
  }
  return response;
}

async function isNewTweet(tweetUrl) {
  try {
    await db.get(tweetUrl);
    return false;
  } catch (error) {
    console.log(error);
    return true;
  }
}

async function scrapeTweetContent(tweetUrl) {
  let content = '';
  try {
    const $ = await scrape(tweetUrl);
    content = $('.tweet-text').text();
  } catch (error) {
    console.log(error);
  }
  return content;
}

module.exports = { checkIfValidTweet };
