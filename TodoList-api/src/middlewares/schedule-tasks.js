const { sendReminder } = require('../controllers/scheduledController');

const CronJob = require('cron').CronJob;

// Define the cron pattern for 12 PM and 11 PM
const cronPattern = '00 19 * * *'; // Runs at 11 AM and 12 PM daily

const job = new CronJob(cronPattern, function() {

  sendReminder().then(()=>{
    console.log("Emails has been sent");
  });
}, null, true, 'UTC');  // Change 'UTC' to your desired timezone

module.exports = job;