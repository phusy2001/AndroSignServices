import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface QuotaPolicyConfig {
  maxFiles: number;
  maxFolders: number;
}

@Injectable()
export class QuotaPolicyMiddleware implements NestMiddleware {
  constructor(private readonly config: QuotaPolicyConfig) {}

  use(req: Request, res: Response, next: NextFunction) {
    const user = req.user; // Retrieve user information from the request (assuming it is set in an earlier middleware)

    // Perform quota policy check
    if (user.documents.length >= this.config.maxDocuments) {
      return res.status(403).json({ error: 'Document quota exceeded' });
    }

    const totalDocumentSize = user.documents.reduce(
      (sum, doc) => sum + doc.size,
      0
    );
    const incomingDocumentSize = req.headers['content-length']
      ? parseInt(req.headers['content-length'])
      : 0;

    if (totalDocumentSize + incomingDocumentSize > this.config.maxFileSize) {
      return res
        .status(403)
        .json({ error: 'Total document size quota exceeded' });
    }

    // Allow the request to proceed if the quota policy is satisfied
    next();
  }
}
