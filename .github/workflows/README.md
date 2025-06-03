# 🤖 GitHub Actions Workflows

This directory contains automated workflows for the AI Updates Tracker. All workflows are designed to be reliable, informative, and self-healing.

## 📋 Available Workflows

### 1. 🤖 Auto-Update AI Feeds (`auto-update.yml`)
**Purpose:** Automatically fetch and update AI news feeds every 2 hours.

**Schedule:** Every 2 hours at 5 minutes past the hour (`5 */2 * * *`)

**Features:**
- Fetches from all active RSS feeds
- Shows database statistics before/after update
- Commits changes automatically with detailed messages
- Creates GitHub issues on failure
- Supports manual triggering with force update option

**Manual Trigger:** 
- Go to Actions → Auto-Update AI Feeds → Run workflow
- Option to force update even if no changes detected

### 2. 🏥 RSS Health Check (`health-check.yml`)
**Purpose:** Monitor RSS feed health and create alerts for failures.

**Schedule:** Daily at 9:00 AM UTC (`0 9 * * *`)

**Features:**
- Tests all RSS feeds for availability and parsing
- Measures response times
- Uploads health reports as artifacts
- Creates GitHub issues for feed failures
- Distinguishes between partial and critical failures

**Manual Trigger:**
- Go to Actions → RSS Health Check → Run workflow

### 3. 🎯 Manual Update (`manual-update.yml`)
**Purpose:** On-demand updates with advanced options and targeting.

**Trigger:** Manual only (workflow_dispatch)

**Features:**
- Target specific companies or update all
- Force update option
- Debug mode for troubleshooting
- Skip commit option for testing
- Detailed logging and summaries
- Creates issues on failure

**Options:**
- **Company:** Choose from dropdown (all, openai, google, meta, aws, microsoft, anthropic, deepmind, arxiv)
- **Force Update:** Update even if no changes detected
- **Debug Mode:** Enable verbose logging
- **Skip Commit:** Test without committing changes

## 🚀 How to Use

### First Time Setup

1. **Enable GitHub Actions:**
   - Go to your repository Settings → Actions
   - Ensure Actions are enabled

2. **Check Permissions:**
   - Go to Settings → Actions → General
   - Under "Workflow permissions", select "Read and write permissions"
   - Check "Allow GitHub Actions to create and approve pull requests"

3. **Test the Workflows:**
   - Go to Actions tab
   - Run "Manual Update" workflow first to test
   - Check that it completes successfully

### Running Workflows

#### Auto-Update (Scheduled)
- Runs automatically every 2 hours
- Check the Actions tab to monitor runs
- Look for commit messages like "🤖 Auto-update: AI feeds - 2024-12-07 09:05 UTC"

#### Manual Updates
1. Go to Actions → Manual Update → Run workflow
2. Select company (or "all" for everything)
3. Enable options as needed
4. Click "Run workflow"

#### Health Checks
- Run automatically daily at 9 AM UTC
- Monitor for GitHub issues tagged with "rss-health"
- Check Actions tab for detailed health reports

### Monitoring

#### Success Indicators
- ✅ Green checkmarks in Actions tab
- Regular commits with update messages
- No "automation" or "rss-health" issues

#### Failure Indicators
- ❌ Red X marks in Actions tab
- GitHub issues created automatically
- Missing commits (check for stopped automation)

#### Common Issues and Solutions

**Issue:** "No changes detected"
- **Normal:** No new content published
- **Check:** Run health check to verify feeds
- **Action:** Try force update or target specific company

**Issue:** "HTTP 404/403 errors"
- **Cause:** RSS feed endpoints changed or blocked
- **Action:** Check health-check workflow artifacts for details
- **Solution:** Update feed URLs in `backend/config/sources.json`

**Issue:** "Permission denied" or commit failures
- **Cause:** Insufficient GitHub Actions permissions
- **Action:** Check Settings → Actions → General → Workflow permissions
- **Solution:** Enable "Read and write permissions"

**Issue:** Node.js or dependency errors
- **Cause:** Package.json changes or dependency conflicts
- **Action:** Check workflow logs for specific error
- **Solution:** Update dependencies or fix package.json

## 📊 Workflow Outputs

### Auto-Update Results
```
=== DATABASE STATS BEFORE UPDATE ===
Total updates: 891
By company:
  openai: 623
  google: 120
  meta: 45
  ...

=== DATABASE STATS AFTER UPDATE ===
Total updates: 932
New updates (last 2h): 41
```

### Health Check Results
```
=== RSS FEED HEALTH CHECK ===
✅ OpenAI: OK (571 items, 1240ms)
✅ Google Research: OK (100 items, 890ms)
❌ Cohere: FAILED (HTTP 404: Not Found)
Success rate: 83.3%
```

### Manual Update Options
- **Company targeting:** Update only specific sources
- **Debug mode:** Detailed logging for troubleshooting
- **Force update:** Override "no changes" detection
- **Skip commit:** Test changes without persisting

## 🔧 Customization

### Changing Update Frequency
Edit the cron schedule in `auto-update.yml`:
```yaml
schedule:
  - cron: '5 */2 * * *'  # Every 2 hours
  - cron: '0 */1 * * *'  # Every hour
  - cron: '0 */4 * * *'  # Every 4 hours
```

### Adding New Companies
Update the manual workflow inputs in `manual-update.yml`:
```yaml
options:
  - 'all'
  - 'openai'
  - 'your_new_company'
```

### Modifying Notifications
Edit the issue creation sections to:
- Change labels and priorities
- Modify issue templates
- Add Slack/Discord webhooks

## 📈 Performance

### Resource Usage
- **Duration:** 2-5 minutes per run
- **API Calls:** ~10-15 RSS requests
- **Storage:** Database grows ~10KB per update cycle
- **Rate Limits:** Well within GitHub Actions limits

### Optimization Tips
- Disable debug mode in production
- Use targeted updates during development
- Monitor health check reports for slow feeds
- Archive old workflow runs periodically

## 🆘 Troubleshooting

### Debug Checklist
1. ✅ Check Actions permissions in repository settings
2. ✅ Verify workflow YAML syntax
3. ✅ Test manual update with debug mode
4. ✅ Run health check for feed status
5. ✅ Check recent commits for patterns
6. ✅ Review issues created by automation

### Emergency Recovery
If all workflows are broken:
1. Run manual update with debug mode
2. Check health-check for feed status
3. Review recent commits for breaking changes
4. Temporarily disable auto-update if needed
5. Fix issues and re-enable automation

### Getting Help
- Check workflow logs in Actions tab
- Review GitHub issues tagged "automation"
- Test locally with `node scripts/fetchUpdates.js`
- Use manual update debug mode for investigation

---

*These workflows were created to provide reliable, automated AI news tracking with comprehensive monitoring and error handling.*