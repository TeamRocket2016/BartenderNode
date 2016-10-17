'use strict';

import winston from 'winston';

const DEFAULT_LOG_LEVEL = process.env.LOG_LEVEL || 'info';

const logger = new (winston.Logger)({
    level: DEFAULT_LOG_LEVEL,
    transports:[
        new (winston.transports.Console)(),
        new (winston.transports.File)({
            name: 'debug-file',
            filename: './winston-debug.log',
            level: 'silly'
        })
    ]    
});

export default logger;
