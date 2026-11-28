import { App, Tags } from 'aws-cdk-lib';
import { buildStacks } from '../lib/app.js';

const app = new App();
buildStacks(app, {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
});
Tags.of(app).add('project', 'gerdquest');
app.synth();
