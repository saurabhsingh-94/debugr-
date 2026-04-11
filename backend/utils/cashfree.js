import pkg from 'cashfree-pg';
const { Cashfree } = pkg;
import config from '../config/config.js';

// Initialize Cashfree Instance singleton configuration
Cashfree.XClientId = config.cashfree.appId;
Cashfree.XClientSecret = config.cashfree.secretKey;
Cashfree.XEnvironment = config.cashfree.env === "PROD" 
    ? Cashfree.Environment.PRODUCTION 
    : Cashfree.Environment.SANDBOX;

export default Cashfree;
