// backend/src/auth/api-key.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<{ headers: Record<string, string> }>();
    const apiKey = request.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.SYNC_API_KEY) {
      throw new UnauthorizedException('Invalid API key');
    }
    return true;
  }
}
