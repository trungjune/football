interface VercelRequest {
  method?: string;
  body?: Record<string, unknown>;
  query?: { [key: string]: string | string[] };
}

interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (data: Record<string, unknown>) => void;
  setHeader: (name: string, value: string) => void;
  end: () => void;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Simple health check without dependencies
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'production',
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
      services: {
        database: {
          status: 'unknown', // Will be checked later
          type: 'postgresql',
        },
      },
    };

    res.status(200).json(healthData);
  } catch (error: any) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error?.message || 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
}
