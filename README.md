theofiloskaxiris.online

## Scheduled API Ping

This repository includes a GitHub Actions workflow (`.github/workflows/pinger.yml`) that sends an HTTP GET request every 15 minutes to keep an external endpoint warm.

### Workflow Details

- Schedule: Every 15 minutes (`*/15 * * * *` in UTC)
- Manual trigger: available via Actions tab (`workflow_dispatch`)
- Failure: job fails on non-2xx/3xx HTTP status (>= 400)
- Concurrency: prevents overlapping runs; timeout set to 2 minutes

The URL is set inline in the workflow step via a line like:

```
URL="https://your-endpoint.example/health"
```

Edit this value directly in `.github/workflows/pinger.yml` to point to the endpoint you want to ping.

### Run Now (Manual Test)

- GitHub UI: Actions → “Ping Endpoint” → “Run workflow”
- GitHub CLI:
	```powershell
	gh workflow run "Ping Endpoint"
	gh run list -L 1 | Select-Object -First 1 | ForEach-Object { ($_ -split '\s+')[0] } | ForEach-Object { gh run view $_ --log }
	```

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

- GitHub Actions cron is best-effort; runs can drift a few minutes.
- Public repos: minutes are generally free; private repos consume monthly minutes (rounded per job to 1 minute). Adjust frequency if needed.
- For strict timing or zero-cost alternatives, consider UptimeRobot/Healthchecks, a Cloudflare Worker Cron, or an Azure Timer Trigger Function.

### Adding Auth Later (Example)

```
			- name: Execute Authenticated HTTP GET
				env:
					API_KEY: ${{ secrets.MY_API_KEY }}
				run: |
					URL="https://your-endpoint.example/health"
					STATUS=$(curl -H "Authorization: Bearer $API_KEY" -s -o /dev/null -w "%{http_code}" "$URL")
					echo "HTTP $STATUS"
					if [ "$STATUS" -lt 200 ] || [ "$STATUS" -ge 400 ]; then exit 1; fi
```

---

If you need an Azure Function timer template or a service worker fallback, open an issue.