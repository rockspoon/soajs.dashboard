"use strict";
const assert = require("assert");
const helper = require("../../../helper.js");
const helpers = helper.requireModule('./lib/git/configGenerator.js');

describe("testing helper git.js", function () {
	it("Fail - Bad config path", function (done) {
		let configPath = "bad path";
		let yamlPath = __dirname + "/../../../uploads/generateConfigFiles/badYamlFile.yml";
		let req = {
			soajs: {
				
				log: {
					debug: function (data) {
					
					},
					error: function (data) {
					
					},
					info: function (data) {
					
					}
				},
				inputmaskData: {},
				validator: {
					Validator: function () {
						return {
							validate: function () {
								return {
									errors: []
								};
							}
						};
					}
				}
			}
		};
		helpers.generate(req, configPath, yamlPath, function (err, res) {
			assert.ok(res);
			done();
		});
	});
	
	it("Fail - Empty Yaml file", function (done) {
		let configPath = {
			type: 'service',
			prerequisites: {cpu: ' ', memory: ' '},
			swagger: true,
			swaggerFilename: 'swagger.yml',
			serviceName: 'express',
			serviceGroup: 'Custom Services',
			serviceVersion: 1,
			servicePort: 4381,
			requestTimeout: 30,
			requestTimeoutRenewal: 5,
			extKeyRequired: true,
			oauth: true,
			session: false,
			urac: false,
			urac_Profile: false,
			urac_ACL: false,
			provision_ACL: false,
			errors: {},
			schema: {}
		};
		let req = {
			soajs: {
				
				log: {
					debug: function (data) {
					
					},
					error: function (data) {
					
					},
					info: function (data) {
					
					}
				},
				inputmaskData: {},
				validator: {
					Validator: function () {
						return {
							validate: function () {
								return {
									errors: []
								};
							}
						};
					}
				}
			}
		};
		helpers.generate(req, configPath, null, function (err, res) {
			assert.ok(res);
			done();
		});
	});
	
	it("Success - config file generated", function (done) {
		let configPath = {
			type: 'service',
			prerequisites: {cpu: ' ', memory: ' '},
			swagger: true,
			swaggerFilename: 'swagger.yml',
			serviceName: 'express',
			serviceGroup: 'Custom Services',
			serviceVersion: 1,
			servicePort: 4381,
			requestTimeout: 30,
			requestTimeoutRenewal: 5,
			extKeyRequired: true,
			oauth: true,
			session: false,
			urac: false,
			urac_Profile: false,
			urac_ACL: false,
			provision_ACL: false,
			errors: {},
			schema: {}
		};
		let req = {
			soajs: {
				
				log: {
					debug: function (data) {
					
					},
					error: function (data) {
					
					},
					info: function (data) {
					
					}
				},
				inputmaskData: {},
				validator: {
					Validator: function () {
						return {
							validate: function () {
								return {
									errors: []
								};
							}
						};
					}
				}
			}
		};
		let yamlPath = {
			token: null,
			downloadLink: 'https://raw.githubusercontent.com/RaghebAD/soajs.nodejs.express/master/swagger.yml',
			content: 'swagger: "2.0"\ninfo:\n  version: "1.0.0"\n  title: express demo\nhost: dev-api.mydomain.com\nbasePath: /express\nschemes:\n  - http\npaths:\n  /tidbit/hello:\n    get:\n      tags:\n        - hello\n      summary: Hello World\n      parameters:\n        - name: username\n          in: query\n          required: true\n          type: string\n        - name: lastname\n          in: query\n          required: true\n          type: string\n      responses:\n        200:\n          description: successful operation\n          schema:\n            type: object\n    post:\n      tags:\n        - hello\n      summary: Returns SOAJS Object\n      responses:\n        200:\n          description: successful operation\n          schema:\n            type: object'
		};
		helpers.generate(req, configPath, yamlPath, function (err, res) {
			assert.ok(res);
			done();
		});
		
	});
});