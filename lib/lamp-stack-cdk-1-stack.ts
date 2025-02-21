import * as cdk from 'aws-cdk-lib';
import { Stack, StackProps } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { getProjectName, getDatabaseUserName, getDatabaseUserPassword } from '../var.env';

const projectName: string = getProjectName();
const databaseUserName: string = getDatabaseUserName();
const databaseUserPassword: string = getDatabaseUserPassword();

export class LampStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // VPC with public and private subnets
    const vpc = new ec2.Vpc(this, `${projectName}-LampVpc`, {
      maxAzs: 2,
      natGateways: 1,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: `${projectName}-PublicSubnet`,
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: `${projectName}-PrivateSubnet`,
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
        {
          cidrMask: 24,
          name: `${projectName}-DatabaseSubnet`,
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });

    // Security Groups
    const albSecurityGroup = new ec2.SecurityGroup(this, `${projectName}-AlbSG`, {
      vpc,
      allowAllOutbound: true,
    });
    albSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'Allow HTTP');

    const instanceSecurityGroup = new ec2.SecurityGroup(this, `${projectName}-InstanceSG`, {
      vpc,
      allowAllOutbound: true,
    });
    instanceSecurityGroup.addIngressRule(albSecurityGroup, ec2.Port.tcp(80), 'Allow HTTP from ALB');

    const dbSecurityGroup = new ec2.SecurityGroup(this, `${projectName}-DatabaseSG`, {
      vpc,
      allowAllOutbound: true,
    });
    dbSecurityGroup.addIngressRule(instanceSecurityGroup, ec2.Port.tcp(3306), 'Allow MySQL from instances');

    // Application Load Balancer
    const alb = new elbv2.ApplicationLoadBalancer(this, `${projectName}-ALB`, {
      vpc,
      internetFacing: true,
      securityGroup: albSecurityGroup,
    });
    const listener = alb.addListener(`${projectName}-Listener`, {
      port: 80,
      open: true,
    });

    // Auto Scaling Group
    const asg = new autoscaling.AutoScalingGroup(this, `${projectName}-ASG`, {
      vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      machineImage: ec2.MachineImage.genericLinux({
        'eu-west-1': 'ami-032a56ad5e480189c', // Ubuntu 22.04 LTS AMI ID for eu-west-1
      }),
      minCapacity: 1,
      maxCapacity: 3,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      securityGroup: instanceSecurityGroup,
      userData: ec2.UserData.custom(`#!/bin/bash\n\n# Update system packages\nsudo apt update -y && sudo apt upgrade -y\n\n# Install Docker\nsudo apt install -y docker.io\nsudo systemctl enable docker\nsudo systemctl start docker\n\n# Add current user to the Docker group\nsudo usermod -aG docker ubuntu\n\n# Pull the PHP server Docker image from Docker Hub\nsudo docker pull chrisncs/php-server:latest\n\n# Run the Docker container, mapping port 80 to 80\nsudo docker run -d --restart unless-stopped --name php-server -p 80:80 chrisncs/php-server:latest`),
    });

    const targetGroup = new elbv2.ApplicationTargetGroup(this, 'TargetGroup', {
      vpc,
      port: 80,
      targets: [],
      healthCheck: { path: '/' },

    });

    asg.attachToApplicationTargetGroup(targetGroup);
    listener.addTargetGroups('TargetGroup', {
      targetGroups: [targetGroup],
    });

    const rdsInstance = new rds.DatabaseInstance(this, 'RDSInstance', {
      engine: rds.DatabaseInstanceEngine.mysql({ version: rds.MysqlEngineVersion.VER_8_0 }),
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      credentials: rds.Credentials.fromPassword(databaseUserName, cdk.SecretValue.unsafePlainText(databaseUserPassword)),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      securityGroups: [dbSecurityGroup],
      multiAz: true,
      allocatedStorage: 20,
      storageEncrypted: true,
      backupRetention: cdk.Duration.days(7),
      deletionProtection: false,
      databaseName: 'contacts'
    });
    
    // Outputs
    new cdk.CfnOutput(this, 'RDSInstanceEndpoint', {
      value: rdsInstance.dbInstanceEndpointAddress,
    });

    new cdk.CfnOutput(this, 'LoadBalancerDNS', {
      value: alb.loadBalancerDnsName,
    });
  }
}
