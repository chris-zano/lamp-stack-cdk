import { config } from "dotenv";

config();

export const getAwsRegion = () : string => {
    return process.env.AWS_ACCOUNT_REGION || "eu-west-1";
}

export const getAwsAccount = () : string => {
    return process.env.AWS_ACCOUNT_ID || "0000";
}

export const getProjectName = () : string => {
    return process.env.PROJECT_NAME || "lamp-stack-cdk-1";
}

export const getDatabaseUserName = () : string => {
    return process.env.DATABASE_USER_NAME || "admin";
}

export const getDatabaseUserPassword = () : string => {
    return process.env.DATABASE_USER_PASSWORD || "admin-password";
}