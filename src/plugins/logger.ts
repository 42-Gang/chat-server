import { pino, LoggerOptions, Logger } from 'pino';
import { context, trace } from '@opentelemetry/api';

let logger: Logger = pino({ level: process.env.LOG_LEVEL || 'info' });

export function setLogger(newLogger: Logger) {
  // Fastify의 logger는 Pino 호환이므로 Logger로 사용
  logger = newLogger;
}

export function getLogger() {
  return logger;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getString(obj: Record<string, unknown>, key: string): string | undefined {
  const v = obj[key];
  return typeof v === 'string' ? v : undefined;
}

function getNumber(obj: Record<string, unknown>, key: string): number | undefined {
  const v = obj[key];
  return typeof v === 'number' ? v : undefined;
}

function getObject(obj: Record<string, unknown>, key: string): Record<string, unknown> | undefined {
  const v = obj[key];
  return isObject(v) ? v : undefined;
}

function getTraceContextFields(): Record<string, unknown> {
  const span = trace.getSpan(context.active());
  if (!span) return {};
  const sc = span.spanContext();
  return {
    trace_id: sc.traceId,
    span_id: sc.spanId,
    trace_flags: sc.traceFlags,
  };
}

const errSerializer = (rowError: unknown) => {
  const error = isObject(rowError) ? rowError : {};
  const name = getString(error, 'name') || 'Error';
  const message = getString(error, 'message') || String(rowError);
  const code = getString(error, 'code');

  const response = getObject(error, 'response');
  const statusCode =
    (response && getNumber(response, 'statusCode')) ?? getNumber(error, 'statusCode');

  const options = getObject(error, 'options');
  const method = options ? getString(options, 'method') : undefined;
  const urlRaw = options ? (options['url'] as unknown) : undefined;
  const request = getObject(error, 'request');
  const requestUrl = request ? getString(request, 'requestUrl') : undefined;

  // Detect got HTTPError-like
  const isGotHttpError = name === 'HTTPError' || code === 'ERR_NON_2XX_3XX_RESPONSE' || !!response;

  const stackRaw = getString(error, 'stack');
  const stack = stackRaw ? stackRaw : undefined;

  const base: Record<string, unknown> = { name, message };
  if (code) base.code = code;
  if (typeof statusCode === 'number') base.statusCode = statusCode;
  if (stack) base.stack = stack;

  if (isGotHttpError) {
    let url: string | undefined;
    if (typeof urlRaw === 'string') url = urlRaw;
    else if (
      isObject(urlRaw) &&
      typeof (urlRaw as { toString?: () => string }).toString === 'function'
    ) {
      try {
        url = (urlRaw as { toString: () => string }).toString();
      } catch {
        url = requestUrl;
      }
    } else {
      url = requestUrl;
    }

    base.http = {
      method,
      url,
    };
  }

  return base;
};

export function getPinoOptions(): LoggerOptions {
  return {
    level: process.env.LOG_LEVEL || 'info',
    redact: {
      paths: ['req.headers.authorization', 'req.headers.cookie', '*.password', '*.token'],
      censor: '[Redacted]',
    },
    formatters: {
      level(label: string) {
        return { level: label };
      },
    },
    mixin() {
      // 각 로그 호출 시 활성 스팬 컨텍스트를 주입
      return getTraceContextFields();
    },
    serializers: {
      err: errSerializer,
    },
  } as LoggerOptions;
}
