# LAMP Stack CDK Project

This project sets up a LAMP (Linux, Apache, MySQL, PHP) stack using AWS CDK. It includes a VPC, an Application Load Balancer, an Auto Scaling Group, and an RDS MySQL instance.

## Prerequisites

- Node.js
- AWS CLI
- AWS CDK
- Docker

## Project Structure

- `bin/lamp-stack-cdk-1.ts`: Entry point for the CDK application.
- `lib/lamp-stack-cdk-1-stack.ts`: Defines the AWS resources for the stack.
- `var.env.ts`: Environment variables configuration.
- `test/lamp-stack-cdk-1.test.ts`: Unit tests for the CDK stack.
- `deploy.sh`: Shell script to build, test, and deploy the stack.

## Setup

1. **Install dependencies:**
    ```bash
    npm install
    ```

2. **Configure environment variables:**
    Create a `.env` file in the root directory with the following content:
    ```env
    AWS_ACCOUNT_REGION=your-aws-region
    AWS_ACCOUNT_ID=your-aws-account-id
    PROJECT_NAME=lamp-stack-cdk-1
    DATABASE_USER_NAME=admin
    DATABASE_USER_PASSWORD=admin-password
    ```

## Deployment

1. **Build the project:**
- To build the typescript project
    ```bash
    npm run build
    ```

2. **Run tests:**
- To only run tests
    ```bash
    npm test
    ```

3. **Deploy the stack:**
- To build the project, run tests and deploy if all tests passed.
    ```bash
    ./deploy.sh
    ```

## Modify User Data Script
The current stack has a user data script that:
 - updates the packages
 - installs docker and adds it to the ubuntu user group
 - pulls a docker-image from docker hub

## CDK Stack Details

- **VPC:** A VPC with public, private, and isolated subnets.
- **Application Load Balancer:** An ALB with a listener on port 80.
- **Auto Scaling Group:** An ASG with instances running a PHP server Docker container.
- **RDS MySQL Instance:** A MySQL database instance with credentials from environment variables.

## Outputs

- **RDSInstanceEndpoint:** The endpoint address of the RDS instance.
- **LoadBalancerDNS:** The DNS name of the Application Load Balancer.

## Testing

Unit tests are located in `test/lamp-stack-cdk-1.test.ts`. Run the tests using:
```bash
npm test
```

## Cleanup

To delete the stack, run:
```bash
cdk destroy
```

## License

This project is licensed under the MIT License.