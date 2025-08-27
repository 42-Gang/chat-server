import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { PrismaInstrumentation } from '@prisma/instrumentation';
import { Span } from '@opentelemetry/api';
import { getLogger } from './plugins/logger.js';

if (!process.env.JAEGER_ENDPOINT) {
  throw new Error('JAEGER_ENDPOINT environment variable is not set');
}
getLogger().info({ jaeger: process.env.JAEGER_ENDPOINT }, 'Using Jaeger endpoint');

interface KafkajsMessage {
  key?: Buffer | string | null;
  value: Buffer | string | null;
  partition?: number;
  headers?: Record<string, Buffer | string | (Buffer | string)[] | undefined>;
  timestamp?: string;
}

const kafkaMessageHook = (
  span: Span,
  { topic, message }: { topic: string; message: KafkajsMessage },
) =>
  span.setAttributes({
    'kafka.topic': topic,
    'kafka.message.key': message.key ? message.key.toString() : undefined,
    'kafka.message.value.length': message.value ? message.value.length : undefined,
  });

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: process.env.JAEGER_ENDPOINT,
    headers: {},
  }),
  serviceName: 'chat-service',
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-kafkajs': {
        enabled: true,
        producerHook: kafkaMessageHook,
        consumerHook: kafkaMessageHook,
      },
    }),
    new PrismaInstrumentation(),
  ],
});

sdk.start();
