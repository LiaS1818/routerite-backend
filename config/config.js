const fs = require('fs');

module.exports = {
	development: {
		username: process.env.DB_USERNAME || 'backend_agent',
		password: process.env.DB_PASSWORD || 'backend_agent',
		database: process.env.DB_NAME || 'routerite',
		host: process.env.DB_HOST || 'localhost',
		port: process.env.DB_PORT || 5432,
		dialect: 'postgres'
	},
	test: {
		username: process.env.CI_DB_USERNAME,
		password: process.env.CI_DB_PASSWORD,
		database: process.env.CI_DB_NAME,
		host: '127.0.0.1',
		port: 3306,
		dialect: 'mysql',
		dialectOptions: {
			bigNumberStrings: true,
		},
	},
	production: {
		username: process.env.PROD_DB_USERNAME,
		password: process.env.PROD_DB_PASSWORD,
		database: process.env.PROD_DB_NAME,
		host: process.env.PROD_DB_HOSTNAME,
		port: process.env.PROD_DB_PORT,
		dialect: 'mysql',
		dialectOptions: {
			bigNumberStrings: true,
			ssl: {
				ca: fs.readFileSync(__dirname + '/mysql-ca-main.crt'),
			},
		},
	},
};
