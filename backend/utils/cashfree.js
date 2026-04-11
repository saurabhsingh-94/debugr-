import { Cashfree, CFEnvironment } from 'cashfree-pg';
import config from '../config/config.js';

// Initialize Cashfree Instance singleton configuration
Cashfree.XClientId = config.cashfree.appId;
Cashfree.XClientSecret = config.cashfree.secretKey;
Cashfree.XEnvironment = config.cashfree.env === "PROD" 
    ? CFEnvironment.PRODUCTION 
    : CFEnvironment.SANDBOX;

export default Cashfree;
