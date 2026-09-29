#!/usr/bin/env node
const minimist = require('minimist');

const { execSync } = require('child_process');

// Get all arguments after the script name
const args = minimist(process.argv.slice(2));

// Find the campaign_Id argument
const campaignId = args.campaignId;
console.log('campaignIdArg------', campaignId);

if (!campaignId) {
  console.error('Error: campaign_Id parameter is required');
  process.exit(1);
}

// Execute the build command with the extracted campaign_Id
try {
  execSync(
    `nx run lang:sync && node libs/lang/.script/sync-translation-temp.js --campaignId=$campaign_Id --k8s_domain_suffix=$k8s_domain_suffix --appName=voucher-landing && nx run voucher-landing:build --campaignId=$campaign_Id && nx run voucher-landing:cexport`,
    {
      stdio: 'inherit'
    }
  );
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
