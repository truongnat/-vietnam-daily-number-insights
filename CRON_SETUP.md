# Cron Jobs Setup for Vietnam Daily Number Insights

This document explains how to set up automated cron jobs for the Vietnam Daily Number Insights application.

## Overview

The application has two main cron jobs:

1. **Daily Analysis** - Runs at 12:00 PM, 4:00 PM, and 5:00 PM Vietnam time
2. **Lottery Results Check** - Runs at 7:00 PM Vietnam time (after lottery results are published)

## Cron Job Endpoints

### 1. Daily Analysis (`/api/cron/daily-analysis`)
- **Purpose**: Fetches and analyzes Vietnamese news to generate lucky number predictions
- **Schedule**: 12:00, 16:00, 17:00 Vietnam time (GMT+7)
- **Method**: POST
- **Authentication**: Requires `Authorization: Bearer ${CRON_SECRET}` header

### 2. Lottery Check (`/api/cron/lottery-check`)
- **Purpose**: Fetches daily lottery results and saves them to the database
- **Schedule**: 19:00 Vietnam time (GMT+7) - after lottery results are published
- **Method**: POST
- **Authentication**: Requires `Authorization: Bearer ${CRON_SECRET}` header

## Environment Variables

Add the following environment variable to your deployment:

```env
CRON_SECRET=your-secure-random-string-here
```

Generate a secure random string for the CRON_SECRET. This prevents unauthorized access to your cron endpoints.

## Deployment Platform Setup

### Vercel (Recommended)

The `vercel.json` file is already configured with the cron schedules:

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-analysis",
      "schedule": "0 12 * * *"
    },
    {
      "path": "/api/cron/daily-analysis", 
      "schedule": "0 16 * * *"
    },
    {
      "path": "/api/cron/daily-analysis",
      "schedule": "0 17 * * *"
    },
    {
      "path": "/api/cron/lottery-check",
      "schedule": "0 19 * * *"
    }
  ]
}
```

**Note**: Vercel cron jobs run in UTC time. The schedules above are adjusted for Vietnam time (GMT+7):
- 12:00 Vietnam time = 05:00 UTC
- 16:00 Vietnam time = 09:00 UTC  
- 17:00 Vietnam time = 10:00 UTC
- 19:00 Vietnam time = 12:00 UTC

### Other Platforms

For other deployment platforms, you can use external cron services like:

#### 1. GitHub Actions (Free)

Create `.github/workflows/cron.yml`:

```yaml
name: Scheduled Tasks
on:
  schedule:
    # Daily analysis at 12:00 PM Vietnam time (5:00 AM UTC)
    - cron: '0 5 * * *'
    # Daily analysis at 4:00 PM Vietnam time (9:00 AM UTC)
    - cron: '0 9 * * *'
    # Daily analysis at 5:00 PM Vietnam time (10:00 AM UTC)
    - cron: '0 10 * * *'
    # Lottery check at 7:00 PM Vietnam time (12:00 PM UTC)
    - cron: '0 12 * * *'

jobs:
  cron:
    runs-on: ubuntu-latest
    steps:
      - name: Call Daily Analysis
        if: github.event.schedule == '0 5 * * *' || github.event.schedule == '0 9 * * *' || github.event.schedule == '0 10 * * *'
        run: |
          curl -X POST https://your-domain.com/api/cron/daily-analysis \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
      
      - name: Call Lottery Check
        if: github.event.schedule == '0 12 * * *'
        run: |
          curl -X POST https://your-domain.com/api/cron/lottery-check \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

#### 2. External Cron Services

Use services like:
- **cron-job.org** (Free)
- **EasyCron** (Free tier available)
- **Cronhub** (Free tier available)

Configure them to make POST requests to:
- `https://your-domain.com/api/cron/daily-analysis` at 05:00, 09:00, 10:00 UTC
- `https://your-domain.com/api/cron/lottery-check` at 12:00 UTC

Include the authorization header: `Authorization: Bearer YOUR_CRON_SECRET`

## Manual Testing

You can test the cron jobs manually:

```bash
# Test daily analysis
curl -X POST http://localhost:3000/api/cron/daily-analysis \
  -H "Authorization: Bearer your-cron-secret"

# Test lottery check
curl -X POST http://localhost:3000/api/cron/lottery-check \
  -H "Authorization: Bearer your-cron-secret"

# Check endpoint status
curl http://localhost:3000/api/cron/daily-analysis
curl http://localhost:3000/api/cron/lottery-check
```

## Monitoring

The cron jobs return JSON responses with success/error information. You can monitor them by:

1. Checking the deployment logs
2. Setting up monitoring services to track the endpoint responses
3. Adding database logging for cron job execution history

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check that CRON_SECRET environment variable is set correctly
2. **500 Internal Server Error**: Check the application logs for specific error details
3. **Timeout**: The Gemini API calls may take time; ensure your platform allows sufficient timeout
4. **Rate Limiting**: Be aware of Gemini API rate limits if running multiple instances

### Logs

Check your deployment platform's logs for detailed error information:
- Vercel: Check Function Logs in the dashboard
- Other platforms: Check application logs or container logs

## Security Notes

- Keep your CRON_SECRET secure and rotate it periodically
- The cron endpoints are protected by the authorization header
- Consider adding IP whitelisting if your platform supports it
- Monitor for unusual activity on the cron endpoints
