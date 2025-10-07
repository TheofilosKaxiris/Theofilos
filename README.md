theofiloskaxiris.online

## Scheduled API Ping

This repository includes a GitHub Actions workflow (`.github/workflows/ping-companycollection.yml`) that sends an HTTP GET request every 10 minutes to keep an external Azure Function / API endpoint warm:

```
https://companycollection-chduerfpevb0h9ga.westeurope-01.azurewebsites.net/api/home
```

### Workflow Details

- Schedule: Every 10 minutes (`*/10 * * * *` in UTC)
- Manual trigger supported via the Actions tab (workflow_dispatch)
- Fails the job if the HTTP status code is >= 400
- Logs the UTC timestamp of each execution

### Modifying the Schedule

Edit the `cron` value inside the workflow file. Cron format used by GitHub: `minute hour day-of-month month day-of-week` (no seconds field).

Examples:
- Every 5 minutes: `*/5 * * * *`
- Once per hour at minute 7: `7 * * * *`
- Daily at 02:15 UTC: `15 2 * * *`

### Disable / Remove

1. Comment out the `schedule` block to pause automatic pings but keep manual trigger.
2. Or delete the workflow file entirely.

### Notes

- GitHub Actions cron is best-effort; execution time may drift by a few minutes.
- If you need guaranteed sub-minute precision or regional hosting, consider an Azure Timer Trigger Function instead.
- No secrets are required for this public GET; if future authentication is added, store credentials in GitHub repository secrets and use them in the curl command.

### Adding Auth Later (Example)

```
			- name: Execute Authenticated HTTP GET
				env:
					API_KEY: ${{ secrets.COMPANY_API_KEY }}
				run: |
					STATUS=$(curl -H "Authorization: Bearer $API_KEY" -s -o /dev/null -w "%{http_code}" "$URL")
```

---

If you need an Azure Function timer template or a service worker fallback, open an issue or request it here.