import yaml from 'js-yaml';

export interface CloudFormationResource {
  id: string;
  type: string;
  properties: Record<string, any>;
}

export function parseCloudFormation(templateContent: string): Record<string, any> {
  try {
    // Parse YAML or JSON
    return yaml.load(templateContent) as Record<string, any>;
  } catch (error) {
    throw new Error(`Failed to parse template: ${error}`);
  }
}


export interface AwsResourceLink {
  name: string;
  type: string;
  url: string;
}

export function generateAwsLink(resourceType: string, resourceName: string, region: string = 'us-east-1'): string | null {
  const baseUrl = `https://console.aws.amazon.com`;

  const links: Record<string, string> = {
    'AWS::Lambda::Function': `${baseUrl}/lambda/home?region=${region}#/functions/${resourceName}`,
    'AWS::DynamoDB::Table': `${baseUrl}/dynamodb/home?region=${region}#tables:selected=${resourceName}`,
    'AWS::S3::Bucket': `${baseUrl}/s3/buckets/${resourceName}`,
    'AWS::EC2::Instance': `${baseUrl}/ec2/v2/home?region=${region}#Instances:search=${resourceName}`,
    'AWS::ApiGateway::RestApi': `${baseUrl}/apigateway/home?region=${region}#/apis/${resourceName}`,
    'AWS::CloudWatch::LogGroup': `${baseUrl}/cloudwatch/home?region=${region}#logsV2:log-groups/log-group/${resourceName}`,
  };

  return links[resourceType] || null;
}
