import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { LampStack } from '../lib/lamp-stack-cdk-1-stack';

test('VPC Created', () => {
    const app = new cdk.App();
    const stack = new LampStack(app, 'TestLampStack');

    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::EC2::VPC', {
        CidrBlock: '10.0.0.0/16'
    });
});

test('Auto Scaling Group Created', () => {
    const app = new cdk.App();
    const stack = new LampStack(app, 'TestLampStack');
    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::AutoScaling::AutoScalingGroup', 1);
});

test('Application Load Balancer Created', () => {
    const app = new cdk.App();
    const stack = new LampStack(app, 'TestLampStack');
    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::ElasticLoadBalancingV2::LoadBalancer', 1);
});

test('RDS MySQL Instance Created', () => {
    const app = new cdk.App();
    const stack = new LampStack(app, 'TestLampStack');
    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::RDS::DBInstance', {
        Engine: 'mysql',
        DBInstanceClass: 'db.t3.micro',
    });
});

test('RDSInstanceEndpoint Output Created', () => {
    const app = new cdk.App();
    const stack = new LampStack(app, 'TestLampStack');
    const template = Template.fromStack(stack);

    template.hasOutput('RDSInstanceEndpoint', {
        Value: {
            "Fn::GetAtt": [
                "RDSInstance9F6B765A",
                "Endpoint.Address"
            ]
        }
    });
});

test('LoadBalancerDNS Output Created', () => {
    const app = new cdk.App();
    const stack = new LampStack(app, 'TestLampStack');
    const template = Template.fromStack(stack);

    template.hasOutput('LoadBalancerDNS', {
        Value: {
            "Fn::GetAtt": [
                "LAMPStackProjectALB01B51914",
                "DNSName"
            ]
        }
    });
});


