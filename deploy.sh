#!/bin/bash

# Exit immediately if any command fails
set -e

echo "🚀 Starting the CDK build process..."

# Step 1: Build the CDK project
echo "🔧 Building the project..."
npm run build

# Step 2: Run Tests
echo "🧪 Running tests..."
npm test

# Check if tests passed
if [ $? -ne 0 ]; then
    echo "❌ Tests failed! Deployment aborted."
    exit 1
else
    echo "✅ Tests passed! Proceeding with deployment..."
fi

# Step 3: Bootstrap the CDK stack
echo "🌱 Bootstrapping the stack..."
cdk bootstrap

# Step 4: Synthesize the CDK stack
echo "🔍 Synthesizing the stack..."
cdk synth

# Step 5: Deploy the CDK stack
echo "🚀 Deploying the stack..."
cdk deploy --require-approval never

echo "🎉 Deployment successful!"
