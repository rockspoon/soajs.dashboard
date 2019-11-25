"use strict";
const assert = require("assert");
const async = require("async");
const helper = require("../../../../helper.js");
const config = require("../../../../../config.js");
const utils = helper.requireModule('./lib/environment/drivers/secrets.js');

let req = {
	soajs: {
		registry: {
			coreDB: {
				provision: {
					name: 'core_provision',
					prefix: '',
					servers: [
						{host: '127.0.0.1', port: 27017}
					],
					credentials: null,
					streaming: {
						batchSize: 10000,
						colName: {
							batchSize: 10000
						}
					},
					URLParam: {
						maxPoolSize: 2, bufferMaxEntries: 0
					},
					registryLocation: {
						l1: 'coreDB',
						l2: 'provision',
						env: 'dev'
					},
					timeConnected: 1491861560912
				}
			}
		},
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
							valid: true,
							errors: []
						};
					}
				};
			}
		}
	}
};
let mongoStub = {
	findEntry: function (soajs, opts, cb) {
		cb(null, {
			"productize": {
				"modifyTemplateStatus": true
			},
			"cluster": {},
			"controller": {},
			"urac": {},
			"oauth": {},
			"nginx": {},
			"user": {}
		});
	},
	updateEntry: function (soajs, opts, cb) {
		cb(null, true);
	},
	saveEntry: function (soajs, opts, cb) {
		cb(null, true);
	},
	removeEntry: function (soajs, opts, cb) {
		cb(null, true);
	},
	closeConnection: function (soajs) {
		return true;
	}
};
let BL = {
	customRegistry: {},
	model: mongoStub,
	cloud: {
		secrets: {
			module: {}
		}
	}
};
let template = {
	"type": "_template",
	"name": "MGTT",
	"description": "Mike Generic Test Template",
	"link": "",
	"content": {
		"custom_registry": {
			"data": [
				{
					"name": "ciConfig",
					"value": {
						"apiPrefix": "cloud-api",
						"domain": "herrontech.com",
						"protocol": "https",
						"port": 443.0
					}
				},
				{
					"name": "ciConfig2",
					"value": "string value here ..."
				},
				{
					"name": "ciConfig3",
					"value": {
						"apiPrefix": "dashboard-api",
						"domain": "soajs.org",
						"protocol": "https",
						"port": 443.0
					}
				}
			]
		},
		"productization": {
			"data": [
				{
					"code": "MIKE",
					"name": "Mike Product",
					"description": "Mike Product Description",
					"packages": [
						{
							"code": "BASIC",
							"name": "Basic Package",
							"description": "Basic Package Description",
							"TTL": 2160000.0,
							"acl": {
								"oauth": {},
								"urac": {},
								"daas": {}
							}
						},
						{
							"code": "MAIN",
							"name": "Main Package",
							"description": "Main Package Description",
							"TTL": 2160000.0,
							"acl": {}
						}
					]
				}
			]
		},
		"tenants": {
			"data": [
				{
					"code": "MIKE",
					"name": "Mike Tenant",
					"description": "Mike Tenant Description",
					"applications": [
						{
							"product": "MIKE",
							"package": "MIKE_MAIN",
							"description": "Mike main application",
							"_TTL": 2160000.0,
							"keys": [
								{
									"extKeys": [
										{
											"device": {},
											"geo": {},
											"dashboardAccess": false,
											"expDate": null
										}
									],
									"config": {
										"a": "b"
									}
								}
							]
						},
						{
							"product": "MIKE",
							"package": "MIKE_USER",
							"description": "Mike Logged In user Application",
							"_TTL": 2160000.0,
							"keys": [
								{
									"extKeys": [
										{
											"device": {},
											"geo": {},
											"dashboardAccess": true,
											"expDate": null
										}
									],
									"config": {
										"c": "d"
									}
								}
							]
						}
					]
				}
			]
		},
		"secrets": {
			"data": [
				{
					"name": "mike"
				}
			]
		},
		"deployments": {
			"repo": {
				"controller": {
					"label": "SOAJS API Gateway",
					"name": "controller",
					"type": "service",
					"category": "soajs",
					"deploy": {
						"memoryLimit": 500.0,
						"mode": "replicated",
						"replicas": 1.0
					}
				}
			},
			"resources": {
				"nginx": {
					"label": "Nginx",
					"type": "server",
					"category": "nginx",
					"ui": "${REF:resources/drivers/server/nginx}",
					"deploy": {
						"memoryLimit": 500.0,
						"mode": "global",
						"secrets": "mike"
					}
				},
				"external": {
					"label": "External Mongo",
					"type": "cluster",
					"category": "mongo",
					"limit": 1.0,
					"ui": "${REF:resources/drivers/cluster/mongo}",
					"deploy": null
				}
			}
		}
	},
	"deploy": {
		database: {
			pre: {
				custom_registry: {
					imfv: [
						{
							name: 'ciConfig',
							locked: true,
							plugged: false,
							shared: true,
							value: {
								test1: true
							}
						},
						{
							name: 'ciConfig2',
							locked: true,
							plugged: false,
							shared: true,
							value: {
								test2: true
							}
						},
						{
							name: 'ciConfig3',
							locked: true,
							plugged: false,
							shared: true,
							value: {
								test3: true
							}
						}
					]
				}
			},
			steps: {
				productization: {
					ui: {
						readOnly: true
					}
				},
				tenants: {
					ui: {
						readOnly: true
					}
				}
			},
			post: {
				'deployments__dot__resources__dot__external': {
					imfv: [
						{
							name: 'external',
							type: 'cluster',
							category: 'mongo',
							locked: false,
							shared: false,
							plugged: false,
							config: {
								username: 'username',
								password: 'pwd'
							}
						}
					],
					"status": {
						"done": true,
						"data": [
							{
								"db": "mongo id of this resource"
							}
						]
					}
				}
			}
		},
		deployments: {
			pre: {},
			steps: {
				secrets: {
					imfv: [
						{
							name: 'mike',
							type: 'Generic',
							data: 'something in secret'
						}
					]
				},
				'deployments__dot__repo__dot__controller': {
					imfv: [
						{
							name: 'controller',
							options: {
								deployConfig: {
									replication: {
										mode: 'replicated',
										replicas: 1
									},
									memoryLimit: 524288000
								},
								gitSource: {
									owner: 'soajs',
									repo: 'soajs.controller',
									branch: 'master',
									commit: '468588b0a89e55020f26b805be0ff02e0f31a7d8'
								},
								custom: {
									sourceCode: {},
									name: 'controller',
									type: 'service'
								},
								recipe: '5ab4d65bc261bdb38a9fe363',
								env: 'MIKE'
							},
							deploy: true,
							type: 'custom'
						}
					],
					"status": {}
					
				},
				'deployments__dot__resources__dot__nginx': {
					imfv: [
						{
							name: 'nginx',
							type: 'server',
							category: 'nginx',
							locked: false,
							shared: false,
							plugged: false,
							config: null,
							deploy: {
								options: {
									deployConfig: {
										replication: {
											mode: 'global'
										},
										memoryLimit: 524288000
									},
									custom: {
										sourceCode: {},
										secrets: [
											{
												name: 'mike',
												mountPath: '/etc/soajs/certs',
												type: 'certificate'
											}
										],
										name: 'mynginx',
										type: 'server'
									},
									recipe: '5ab4d65bc261bdb38a9fe363',
									env: 'MIKE'
								},
								deploy: true,
								type: 'custom'
							}
						}
					]
				}
			},
			post: {}
		}
	}
};
let environmentRecord = {
	_id: '5a58d942ace01a5325fa3e4c',
	code: 'DASHBORAD',
	deployer: {
		"type": "container",
		"selected": "container.docker.local",
		"container": {
			"docker": {
				"local": {
					"socketPath": "/var/run/docker.sock"
				},
				"remote": {
					"nodes": ""
				}
			},
			"kubernetes": {
				"local": {
					"nginxDeployType": "",
					"namespace": {},
					"auth": {
						"token": ""
					}
				},
				"remote": {
					"nginxDeployType": "",
					"namespace": {},
					"auth": {
						"token": ""
					}
				}
			}
		}
	},
	dbs: {
		clusters: {
			oneCluster: {
				servers: {}
			}
		},
		config: {
			session: {
				cluster: 'oneCluster'
			}
		}
	},
	services: {},
	profile: ''
};

let lib = {
	initBLModel: function (module, modelName, cb) {
		return cb(null, {
			add: function (context, req, data, cb) {
				return cb(null, true);
			},
			delete: function (context, req, data, cb) {
				return cb(null, true);
			}
		});
	},
	checkReturnError: function (req, {}, {}, cb) {
		return cb(null, true);
	}
};

let context = {
	BL: BL,
	environmentRecord: {},
	template: {},
	config: config,
	errors: [],
	opts: {}
};

describe("Testing secrets.js", function () {
	
	describe("Testing Validate", function () {
		
		beforeEach(() => {
			context.template = JSON.parse(JSON.stringify(template));
			context.environmentRecord = environmentRecord;
			context.errors = [];
		});
		
		it("Fail no Secrets in content", function (done) {
			
			context.template.content = {};
			utils.validate(req, context, lib, async, BL, 'mongo', function (err, body) {
				assert.ok(context.errors);
				assert.deepEqual(context.errors[0], {
					"code": 172,
					"msg": 'The template does not support deploying secrets'
				});
				done();
			});
		});
		
		it("Fail no Data in Secrets", function (done) {
			context.template.content.secrets = {};
			utils.validate(req, context, lib, async, BL, 'mongo', function (err, body) {
				assert.ok(context.errors);
				assert.deepEqual(context.errors[0], {
					"code": 172,
					"msg": 'The template does not support deploying secrets'
				});
				done();
			});
		});
		
		it("Fail Data is not of type array", function (done) {
			context.template.content.secrets.data = {};
			utils.validate(req, context, lib, async, BL, 'mongo', function (err, body) {
				assert.ok(context.errors);
				assert.deepEqual(context.errors[0], {
					"code": 172,
					"msg": 'The template does not support deploying secrets'
				});
				done();
			});
		});
		
		it("Fail no data in Data array", function (done) {
			context.template.content.secrets.data = [];
			utils.validate(req, context, lib, async, BL, 'mongo', function (err, body) {
				assert.ok(context.errors);
				assert.deepEqual(context.errors[0], {
					"code": 172,
					"msg": 'The template does not support deploying secrets'
				});
				done();
			});
		});
		
		it("Fail no Inputs in OPTS", function (done) {
			utils.validate(req, context, lib, async, BL, 'mongo', function (err, body) {
				assert.ok(context.errors);
				assert.deepEqual(context.errors[0], {
					"code": 172,
					"msg": 'Mismatch between the number of inputs provided and the template entries in secrets!'
				});
				done();
			});
		});
		
		it("Fail Inputs in OPTS is not of type array", function (done) {
			context.opts.inputs = {};
			utils.validate(req, context, lib, async, BL, 'mongo', function (err, body) {
				assert.ok(context.errors);
				assert.deepEqual(context.errors[0], {
					"code": 172,
					"msg": 'Mismatch between the number of inputs provided and the template entries in secrets!'
				});
				done();
			});
		});
		
		it("Fail Inputs in OPTS is has no entries", function (done) {
			context.opts.inputs = [];
			utils.validate(req, context, lib, async, BL, 'mongo', function (err, body) {
				assert.ok(context.errors);
				assert.deepEqual(context.errors[0], {
					"code": 172,
					"msg": 'Mismatch between the number of inputs provided and the template entries in secrets!'
				});
				done();
			});
		});
		
		it("Success Validation No Name in Data", function (done) {
			context.template.content.secrets.data = [{"nothing": "nothing"}];
			context.opts.inputs = [{"name": "mike"}];
			utils.validate(req, context, lib, async, BL, 'mongo', function (err, body) {
				assert.deepEqual(context.errors.length, 0);
				done();
			});
		});
		
		it("Success Validationinput data is not object", function (done) {
			context.opts.inputs = ["test"];
			utils.validate(req, context, lib, async, BL, 'mongo', function (err, body) {
				done();
			});
		});
		
		it("Success Validation", function (done) {
			context.opts.inputs = [{"name": "mike"}];
			utils.validate(req, context, lib, async, BL, 'mongo', function (err, body) {
				assert.deepEqual(context.errors.length, 0);
				done();
			});
		});
		
		it("Success Validation kuberentes deployment", function (done) {
			context.environmentRecord.deployer.selected = "container.kubernetes.local";
			context.config = config;
			utils.validate(req, context, lib, async, BL, 'mongo', function (err, body) {
				assert.deepEqual(context.errors.length, 0);
				done();
			});
		});
		
		it("Success Validation with errors", function (done) {
			context.opts.inputs = [{"name": "mike"}];
			req.soajs.validator = {
				Validator: function () {
					return {
						validate: function () {
							return {
								errors: [{error: 'msg'}]
							};
						}
					};
				}
			};
			utils.validate(req, context, lib, async, BL, 'mongo', function (err, body) {
				req.soajs.validator = {
					Validator: function () {
						return {
							validate: function () {
								return {
									errors: []
								};
							}
						};
					}
				};
				done();
			});
		});
	});
	
	describe("Testing Deploy", function () {
		
		beforeEach(() => {
			context.template = JSON.parse(JSON.stringify(template));
			context.environmentRecord = environmentRecord;
			context.errors = [];
		});
		
		it("Success Previously Completed", function (done) {
			
			context.opts.stage = "deployments";
			context.opts.group = "steps";
			context.opts.stepPath = "secrets";
			
			context.template.deploy.deployments.steps.secrets.status = {"done": {}};
			
			utils.deploy(req, context, lib, async, BL, 'mongo', function (err, body) {
				assert.deepEqual(err, null);
				assert.deepEqual(body, true);
				done();
			});
		});
		
		it("Success No Secrets to Create", function (done) {
			
			context.opts.stage = "deployments";
			context.opts.group = "steps";
			context.opts.stepPath = "secrets";
			
			context.template.content.secrets.data = [];
			
			utils.deploy(req, context, lib, async, BL, 'mongo', function (err, body) {
				done();
			});
		});
		
		it("Success Previously Processed", function (done) {
			
			context.opts.stage = "deployments";
			context.opts.group = "steps";
			context.opts.stepPath = "secrets";
			
			context.template.deploy.deployments.steps.secrets.status = {"data": {"name": "mike"}};
			
			utils.deploy(req, context, lib, async, BL, 'mongo', function (err, body) {
				assert.deepEqual(err, null);
				assert.deepEqual(body, true);
				done();
			});
		});
		
		it("Success Deploy", function (done) {
			
			context.opts.stage = "deployments";
			context.opts.group = "steps";
			context.opts.stepPath = "secrets";
			
			context.opts.inputs = [{"name": "mike"}];
			
			utils.deploy(req, context, lib, async, BL, 'mongo', function (err, body) {
				assert.deepEqual(err, null);
				assert.deepEqual(body, true);
				done();
			});
		});
		
	});
	
	describe("Testing Rollback", function () {
		
		beforeEach(() => {
			context.template = JSON.parse(JSON.stringify(template));
			context.environmentRecord = environmentRecord;
			context.errors = [];
		});
		
		it("Success Rollback No Status", function (done) {
			
			context.opts.stage = "deployments";
			context.opts.group = "steps";
			context.opts.stepPath = "secrets";
			
			context.opts.inputs = [{"name": "mike"}];
			
			utils.rollback(req, context, lib, async, BL, 'mongo', function (err, body) {
				assert.deepEqual(err, null);
				assert.deepEqual(body, true);
				done();
			});
		});
		
		it("Success Rollback status not done", function (done) {
			
			context.opts.stage = "deployments";
			context.opts.group = "steps";
			context.opts.stepPath = "secrets";
			
			context.opts.inputs = [{"name": "mike"}];
			context.template.deploy.deployments.steps.secrets.status = {};
			utils.rollback(req, context, lib, async, BL, 'mongo', function (err, body) {
				assert.deepEqual(err, null);
				assert.deepEqual(body, true);
				done();
			});
		});
		
		it("Success Rollback", function (done) {
			
			context.opts.stage = "deployments";
			context.opts.group = "steps";
			context.opts.stepPath = "secrets";
			
			context.opts.inputs = [{"name": "mike"}];
			
			context.template.deploy.deployments.steps.secrets.status = {"done": {}, "data": {"name": "mike"}};
			
			utils.rollback(req, context, lib, async, BL, 'mongo', function (err, body) {
				assert.deepEqual(err, null);
				assert.deepEqual(body, true);
				done();
			});
		});
		
		it("Success Rollback with error", function (done) {
			context.opts.stage = "deployments";
			context.opts.group = "steps";
			context.opts.stepPath = "secrets";
			
			context.opts.inputs = [{"name": "mike"}];
			
			context.template.deploy.deployments.steps.secrets.status = {"done": {}, "data": {"name": "mike"}};
			lib = {
				initBLModel: function (module, modelName, cb) {
					return cb(null, {
						add: function (context, req, data, cb) {
							return cb(null, true);
						},
						delete: function (context, req, data, cb) {
							return cb(true);
						}
					});
				},
				checkReturnError: function (req, {}, {}, cb) {
					return cb(null, true);
				}
			};
			utils.rollback(req, context, lib, async, BL, 'mongo', function (err, body) {
				assert.deepEqual(body, true);
				done();
			});
		});
	});
});
