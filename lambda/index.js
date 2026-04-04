/**
 * AWS Lambda — Subscription Renewal Checker
 *
 * Triggered by EventBridge (daily at 8 AM UTC).
 * Queries the RDS database for subscriptions renewing within N days,
 * then publishes an SNS alert per user.
 *
 * Environment variables required:
 *   DB_HOST, DB_NAME, DB_USER, DB_PASSWORD, DB_PORT
 *   SNS_TOPIC_ARN
 *   REMINDER_DAYS (default: 3)
 */

const { Client } = require('pg');
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');

const snsClient = new SNSClient({ region: process.env.AWS_REGION || 'us-east-1' });

const getDbClient = () => new Client({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: { rejectUnauthorized: false },
});

exports.handler = async (event) => {
  console.log('Lambda triggered:', JSON.stringify(event));

  const reminderDays = parseInt(process.env.REMINDER_DAYS || '3');
  const db = getDbClient();

  try {
    await db.connect();
    console.log('DB connected');

    const { rows } = await db.query(`
      SELECT
        s.id,
        s.name AS subscription_name,
        s.amount,
        s.currency,
        s.next_renewal_date,
        s.billing_cycle,
        u.email AS user_email,
        u.name  AS user_name,
        u.phone_number,
        u.reminder_days_before,
        (s.next_renewal_date - CURRENT_DATE) AS days_until_renewal
      FROM subscriptions s
      JOIN users u ON s.user_id = u.id
      WHERE s.active = true
        AND u.email_notifications = true
        AND s.next_renewal_date BETWEEN CURRENT_DATE AND CURRENT_DATE + $1
      ORDER BY s.next_renewal_date ASC
    `, [reminderDays]);

    console.log(`Found ${rows.length} subscriptions renewing within ${reminderDays} days`);

    const results = await Promise.allSettled(
      rows.map(row => publishAlert(row))
    );

    const succeeded = results.filter(r => r.status === 'fulfilled').length;
    const failed    = results.filter(r => r.status === 'rejected').length;

    console.log(`Alerts sent: ${succeeded} succeeded, ${failed} failed`);
    return { statusCode: 200, body: JSON.stringify({ succeeded, failed, total: rows.length }) };

  } catch (err) {
    console.error('Lambda error:', err);
    throw err;
  } finally {
    await db.end();
  }
};

async function publishAlert(row) {
  const message = JSON.stringify({
    subscriptionName: row.subscription_name,
    amount: parseFloat(row.amount),
    currency: row.currency,
    renewalDate: row.next_renewal_date,
    daysUntilRenewal: parseInt(row.days_until_renewal),
    userEmail: row.user_email,
    userName: row.user_name,
  });

  const command = new PublishCommand({
    TopicArn: process.env.SNS_TOPIC_ARN,
    Message: message,
    Subject: `Reminder: ${row.subscription_name} renews in ${row.days_until_renewal} day(s)`,
    MessageAttributes: {
      userEmail: {
        DataType: 'String',
        StringValue: row.user_email,
      },
    },
  });

  const response = await snsClient.send(command);
  console.log(`Alert sent for ${row.subscription_name} → ${row.user_email} (messageId: ${response.MessageId})`);
  return response;
}
