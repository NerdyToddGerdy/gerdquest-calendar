import { RemovalPolicy } from 'aws-cdk-lib';
import type { Config } from './config.js';

/** Prod keeps data when a stack is deleted; dev tears down to $0. */
export const dataRemovalPolicy = (c: Config) => (c.stage === 'prod' ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY);
