import { Duration, RemovalPolicy } from 'aws-cdk-lib';
import { Architecture, LoggingFormat, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, OutputFormat, type NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export interface ServiceFunctionProps {
  /** Absolute path to the handler file. */
  entry: string;
  environment?: Record<string, string>;
  memorySize?: number;
  timeout?: Duration;
  description?: string;
}

/**
 * The one way to make a Lambda here, so the cost guardrails in ADR 0004 hold
 * by construction: arm64, Node 24, no VPC, its own log group kept 7 days,
 * small memory, short timeout, ESM bundle with the AWS SDK left out (it ships
 * in the runtime).
 */
export class ServiceFunction extends NodejsFunction {
  constructor(scope: Construct, id: string, props: ServiceFunctionProps) {
    const logGroup = new LogGroup(scope, `${id}Logs`, {
      retention: RetentionDays.ONE_WEEK,
      removalPolicy: RemovalPolicy.DESTROY,
    });
    const base: NodejsFunctionProps = {
      entry: props.entry,
      handler: 'handler',
      runtime: Runtime.NODEJS_24_X,
      architecture: Architecture.ARM_64,
      memorySize: props.memorySize ?? 256,
      timeout: props.timeout ?? Duration.seconds(5),
      description: props.description,
      environment: props.environment,
      logGroup,
      loggingFormat: LoggingFormat.JSON,
      bundling: {
        format: OutputFormat.ESM,
        target: 'node24',
        minify: true,
        sourceMap: false,
        externalModules: ['@aws-sdk/*'],
      },
    };
    super(scope, id, base);
  }
}
