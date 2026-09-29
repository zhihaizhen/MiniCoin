#!/usr/bin/env node

const { execSync } = require('child_process');

// Get all arguments after the script name
const args = process.argv.slice(2);

// Find the campaign_Id argument
const campaignIdArg = args
  .find((arg) => arg.startsWith('--campaignId='))
  ?.split('=')[1];
console.log('campaignIdArg------', campaignIdArg);

if (!campaignIdArg) {
  console.error('Error: campaign_Id parameter is required');
  process.exit(1);
}

// Extract the campaign_Id value
const campaignId = campaignIdArg.split('=')[1];

// Execute the build command with the extracted campaign_Id
try {
  execSync(
    `node libs/lang/.script/sync-translation-temp.js --campaignId=$campaign_Id && nx serve reward-landing --campaignId=$campaign_Id`,
    {
      stdio: 'inherit'
    }
  );
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
