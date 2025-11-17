# Resend Email Setup Guide

This guide explains how to configure Resend for email notifications in MiniFeria.

## Why Resend?

- **Free Tier**: 3,000 emails/month, 100 emails/day
- **Pay-as-you-go**: $1 per 1,000 additional emails
- **Simple API**: Modern, easy-to-use API
- **Great Deliverability**: High email delivery rates
- **No Credit Card Required**: For the free tier

## Setup Steps

### 1. Create a Resend Account

1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### 2. Get Your API Key

1. Log in to your Resend dashboard
2. Go to [API Keys](https://resend.com/api-keys)
3. Click "Create API Key"
4. Give it a name (e.g., "MiniFeria Production")
5. Select permissions (or use "Full Access" for development)
6. Copy the API key (starts with `re_`)

### 3. Configure Environment Variables

Add to your `.env` file:

```bash
RESEND_API_KEY="re_your_api_key_here"
FROM_EMAIL="MiniFeria <onboarding@resend.dev>"
```

**Note**: The default `onboarding@resend.dev` email works for testing but will show "via resend.dev" in recipients' inboxes.

### 4. (Optional) Add Your Domain

To use your own email address (e.g., `notificaciones@miniferias.pe`):

1. Go to [Domains](https://resend.com/domains)
2. Click "Add Domain"
3. Enter your domain (e.g., `miniferias.pe`)
4. Add the provided DNS records to your domain provider:
   - TXT record for domain verification
   - MX records for receiving emails
   - DKIM records for authentication
5. Wait for DNS propagation (can take up to 48 hours)
6. Once verified, update your `.env`:

```bash
FROM_EMAIL="MiniFeria <notificaciones@miniferias.pe>"
```

## Email Types

The application sends the following emails:

### 1. Order Confirmation
Sent when a customer places an order.

```javascript
sendOrderConfirmation(order, user)
```

### 2. Order Status Updates
Sent when an order status changes (confirmed, shipped, delivered, etc.).

```javascript
sendOrderStatusUpdate(order, user, newStatus)
```

### 3. Event Reminders
Sent to users who subscribed to event reminders.

```javascript
sendEventReminder(event, email)
```

## Testing

### Test Email Sending

Create a test script (`backend/test-email.js`):

```javascript
import { sendEmail } from './src/services/email.service.js';
import dotenv from 'dotenv';

dotenv.config();

async function testEmail() {
  try {
    const result = await sendEmail({
      to: 'your-email@example.com',
      subject: 'Test Email from MiniFeria',
      html: '<h1>Hello!</h1><p>This is a test email.</p>',
      text: 'Hello! This is a test email.'
    });

    console.log('Email sent successfully:', result);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

testEmail();
```

Run the test:

```bash
node backend/test-email.js
```

### Check Email Logs

1. Go to [Resend Emails](https://resend.com/emails)
2. View all sent emails, their status, and delivery details
3. Debug any delivery issues

## Limits & Pricing

### Free Tier
- **3,000 emails/month**
- **100 emails/day**
- Perfect for getting started

### Paid Plans
Once you exceed the free tier:
- **$1 per 1,000 emails**
- No monthly commitment
- Pay only for what you use

### Example Costs
- 5,000 emails/month = $2/month (2,000 over free tier)
- 10,000 emails/month = $7/month (7,000 over free tier)
- 50,000 emails/month = $47/month

## Best Practices

1. **Use a Custom Domain**: Better deliverability and brand recognition
2. **Monitor Your Limits**: Check Resend dashboard to avoid hitting rate limits
3. **Handle Errors**: The service gracefully handles missing API keys
4. **Test Thoroughly**: Always test emails before sending to customers

## Troubleshooting

### Email not sending?
- Check that `RESEND_API_KEY` is set in `.env`
- Verify the API key is valid in Resend dashboard
- Check server logs for error messages
- Verify you haven't hit rate limits (100/day on free tier)

### Emails going to spam?
- Add your domain to Resend
- Configure SPF, DKIM, and DMARC records
- Avoid spam trigger words in subject/body
- Maintain a good sender reputation

### Need more emails?
- Upgrade to paid plan (automatic)
- Or consider batch sending for newsletters
- Monitor usage in Resend dashboard

## Alternative Providers

If you need to switch providers, the email service is abstracted. Just update `backend/src/services/email.service.js`:

- **Brevo**: 300 emails/day free (good for higher volume)
- **Amazon SES**: $0.10 per 1,000 emails (requires AWS)
- **Mailgun**: $0.80 per 1,000 emails
- **Postmark**: $1.25 per 1,000 emails (best deliverability)

## Support

- [Resend Documentation](https://resend.com/docs)
- [Resend API Reference](https://resend.com/docs/api-reference)
- [Resend Support](https://resend.com/support)
