require('dotenv').config();
const crypto = require('crypto');
const axios = require('axios');
const bizSdk = require('facebook-nodejs-business-sdk');
const Campaign = bizSdk.Campaign.Fields;

const accessToken = process.env.FACEBOOK_API_TOKEN;
const appSecret = process.env.FACEBOOK_APP_SECRET;
const accountId = process.env.TEST_AD_ACCOUNT_ID;

// Function to generate appsecret_proof
function generateSecretProof(accessToken, appSecret) {
  return crypto
    .createHmac('sha256', appSecret)
    .update(accessToken)
    .digest('hex');
}

const secretProof = generateSecretProof(accessToken, appSecret);
console.log(secretProof);

// Get today's date and the date 30 days ago
const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
const thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 600))
  .toISOString()
  .split('T')[0];

// Make the API request to get insights for the past 30 days
axios
  .get(`https://graph.facebook.com/v20.0/${accountId}/insights`, {
    params: {
      level: 'campaign', // Get data at the campaign level
      fields: `campaign_name,impressions,clicks,spend,${Campaign.id}`, // Specify the fields you want to retrieve
      time_range: {
        // Specify the date range for the past 30 days
        since: thirtyDaysAgo,
        until: today,
      },
      access_token: accessToken, // Add the access token
      appsecret_proof: secretProof, // Add the appsecret_proof
    },
  })
  .then((response) => {
    // Print the data for each campaign
    console.log('Campaign Insights for the Past 365 Days:');
    response.data.data.forEach((campaign) => {
      console.log(
        `Campaign Name: ${campaign.campaign_name}, Impressions: ${campaign.impressions}, Clicks: ${campaign.clicks}, Spend: ${campaign.spend}`
      );
    });
  })
  .catch((error) => {
    console.error(
      'Error fetching campaign data:',
      error.response ? error.response.data : error.message
    );
  });
