// backend/src/webhooks/webhooks.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(private readonly httpService: HttpService) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async handleSentryAlert(payload: any) {
    this.logger.log('Received Sentry alert');

    // Check if it's an issue alert
    // Sentry Webhook payload structure: https://docs.sentry.io/product/integrations/integration-platform/webhooks/
    const { action, data } = payload;

    if (action === 'created' && data?.issue) {
      const issue = data.issue;
      const project = data.issue.project?.slug || 'unknown-project';

      // Only create GitHub issue for "critical" or "error" level if specified,
      // but for now we'll process what Sentry sends (filtered by alert rules in Sentry UI)

      const title = `[Sentry] ${issue.title}`;
      const body = `
## Sentry Issue Details
- **Project:** ${project}
- **Level:** ${issue.level}
- **First Seen:** ${issue.firstSeen}
- **URL:** ${issue.permalink}

### Summary
${issue.culprit}

---
*Automatically created by ThangVQ Digital Hub Webhook Handler*
`;

      await this.createGithubIssue(title, body);
    }

    return { status: 'processed' };
  }

  private async createGithubIssue(title: string, body: string) {
    const githubToken = process.env.GH_PAT;
    const repoOwner = 'thangvq95';
    const repoName = 'thangvq-digital-hub';

    if (!githubToken) {
      // Return early if no token, don't crash
      // But log a clear warning
      this.logger.error('GH_PAT not found in environment variables');
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await firstValueFrom(
        this.httpService.post(
          `https://api.github.com/repos/${repoOwner}/${repoName}/issues`,
          { title, body, labels: ['bug', 'sentry'] },
          {
            headers: {
              Authorization: `Bearer ${githubToken}`,
              Accept: 'application/vnd.github.v3+json',
            },
          },
        ),
      );
      this.logger.log(`GitHub issue created: ${response.data.html_url}`);
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      this.logger.error(`Failed to create GitHub issue: ${error.message}`);
      if (error.response) {
        this.logger.error(
          `GitHub API Error: ${JSON.stringify(error.response.data)}`,
        );
      }
    }
  }
}
