"use strict";
const async = require("async");
const helper = require("../../../../helper.js");
const config = require("../../../../../config.js");
const utils = helper.requireModule('./lib/environment/drivers/tenants.js');

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
	customRegistry: {
		module: {}
	},
	model: mongoStub,
	cd: {
		module: {}
	},
	cloud: {
		deploy: {
			module: {}
		},
		services: {
			module: {}
		},
		resources: {
			module: {}
		}
	},
	resources: {
		module: {}
	},
	products: {
		module: {}
	},
	tenants: {
		module: {}
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
		"tenant": {
			"data": [
				{
					"code": "MIKE",
					"name": "Mike Tenant",
					"description": "Mike Tenant Description",
					"oauth": {
						"secret": "skdasldf",
						"redirectURI": "",
						"grants": [
							"passwo34234rd",
							"refresh_token"
						]
					},
					"applications": [
						{
							"product": "MIKE",
							"package": "MIKE_MAIN",
							"description": "Mike main application",
							"_TTL": 2160000.0,
							"acl": {},
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
										"urac": {
											link: {
												"addUser": "http://%domain%/#/setNewPassword",
											}
										}
									}
								}
							]
						},
						{
							"product": "MIKE",
							"package": "MIKE_USER",
							"description": "Mike Logged In user Application",
							"_TTL": 2160000.0,
							"acl": {},
							"keys": [
								{
									"key": "38145c67717c73d3febd16df38abf311",
									"extKeys": [
										{
											"expDate": 1523441769359,
											"extKey": "123123",
											"device": null,
											"geo": null,
											"dashboardAccess": true,
											"env": "DASHBOARD"
										}
									],
									"config": {
										"dev": {
											"oauth": {
												"loginMode": "urac"
											},
											"mail": {},
											"urac": {}
										}
									}
								}
							]
						}
					]
				},
				{
					"code": "MIKE2",
					"name": "Mike Tenant 2",
					"description": "Mike Tenant Description",
					"applications": [
						{
							"product": "MIKE",
							"package": "MIKE_MAIN",
							"description": "Mike main application",
							"_TTL": 2160000.0,
							"acl": {},
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
							"acl": {},
							"keys": [
								{
									"key": "38145c67717c73d3febd16df38abf311",
									"extKeys": [
										{
											"expDate": 1523441769359,
											"extKey": "123123",
											"device": null,
											"geo": null,
											"dashboardAccess": true,
											"env": "DASHBOARD"
										}
									],
									"config": {
										"dev": {
											"oauth": {
												"loginMode": "urac"
											},
											"mail": {},
											"urac": {}
										}
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
				tenant: {
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
				'deployments.repo.controller': {
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
				'deployments.resources.nginx': {
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
										type: 'server',
										ports: [{
											name: "https",
											port: 80
										}]
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
let tenantRecord = {
	"_id": "1",
	"oauth": {
		"secret": "secret",
		"redirectUri": "",
		"grants": [
			"password",
			"refresh_token"
		]
	},
	"code": "MIKE",
	"name": "Dashboard Tenant",
	
	"description": "Mike Tenant Description",
	"applications": [
		{
			"product": 'RAGH',
			"package": 'RAGH_MAIN',
			"appId": "2222",
			"description": 'Mike second application',
			"_TTL": 2160000,
			"keys": [
				{
					"key": "38145c67717c73d3febd16df38abf311",
					"extKeys": [
						{
							"expDate": 1523441769359,
							"extKey": "123123",
							"device": null,
							"geo": null,
							"dashboardAccess": true,
							"env": "DASHBOARD"
						},
						{
							"expDate": 1523441769359,
							"extKey": "123122131",
							"device": null,
							"geo": null,
							"dashboardAccess": true,
							"env": "DEV"
						}
					],
					"config": {
						"dev": {
							"oauth": {
								"loginMode": "urac"
							},
							"mail": {},
							"urac": {}
						}
					}
				}
			]
		},
		{
			"product": 'MIKE',
			"package": 'MIKE_USER',
			"description": 'Mike Logged In user Application',
			"appId": "33333",
			"_TTL": 2160000,
			"keys": [
				{
					"key": "38145c67717c73d3febd16df38abf311",
					"extKeys": [
						{
							"expDate": 1523441769359,
							"extKey": "123123",
							"device": null,
							"geo": null,
							"dashboardAccess": true,
							"env": "DASHBOARD"
						}
					],
					"config": {
						"dev": {
							"oauth": {
								"loginMode": "urac"
							},
							"mail": {},
							"urac": {}
						}
					}
				},
				{
					"key": "1231",
					"extKeys": [
						{
							"expDate": 1523441769359,
							"extKey": "123123",
							"device": null,
							"geo": null,
							"dashboardAccess": true,
							"env": "DASHBOARD"
						}
					],
					"config": {
						"dev": {
							"oauth": {
								"loginMode": "urac"
							},
							"mail": {},
							"urac": {}
						}
					}
				}
			]
		}
	]
};
let environmentRecord = {
	_id: '5a58d942ace01a5325fa3e4c',
	code: 'DASHBOARD',
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
	domain: "dashboard.com",
	sitePrefix: "site",
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
			get: function (context, req, data, cb) {
				return cb(null, tenantRecord);
			},
			delete: function (context, req, data, cb) {
				return cb(null, true);
			},
			addApplication: function (context, req, data, cb) {
				return cb(null, true);
			},
			saveOAuth: function (context, code, message, req, data, cb) {
				return cb(null, true);
			},
			createApplicationKey: function (context, req, provision, data, cb) {
				return cb(null, true);
			},
			addApplicationExtKeys: function (context, soajsCore, req, data, cb) {
				return cb(null, true);
			},
			updateApplicationConfig: function (context, req, data, cb) {
				return cb(null, true);
			},
		});
	},
	checkReturnError: function (req, {}, {}, cb) {
		return cb(null, true);
	}
};
let context = {};
describe("testing tenants.js", function () {
	
	describe("testing validate", function () {
		
		it("fail does not support deploying tenants", function (done) {
			context = {
				BL: BL,
				environmentRecord: environmentRecord,
				template: {content: {}},
				config: config,
				errors: [],
				opts: {
					stage: 'database',
					group: 'steps',
					stepPath: 'tenant',
					section: 'tenant'
				}
			};
			utils.validate(req, context, lib, async, BL, 'mongo', function (err, body) {
				done();
			});
		});
		
		it("success", function (done) {
			context = {
				BL: BL,
				environmentRecord: environmentRecord,
				template: JSON.parse(JSON.stringify(template)),
				config: config,
				errors: [],
				opts: {
					stage: 'database',
					group: 'steps',
					stepPath: 'tenant',
					section: 'tenant'
				}
			};
			utils.validate(req, context, lib, async, BL, 'mongo', function (err, body) {
				done();
			});
		});
	});
	
	describe("testing deploy", function () {
		
		it("success products already deployed", function (done) {
			context = {
				BL: BL,
				environmentRecord: environmentRecord,
				template: JSON.parse(JSON.stringify(template)),
				config: config,
				errors: [],
				opts: {
					stage: 'database',
					group: 'steps',
					stepPath: 'tenant',
					section: 'tenant'
				}
			};
			context.template.deploy.database.steps["tenant"].status = {
				done: true
			};
			utils.deploy(req, context, lib, async, BL, 'mongo', function (err, body) {
				done();
			});
		});
		
		it("success tenants with no data entries", function (done) {
			context = {
				BL: BL,
				environmentRecord: environmentRecord,
				template: JSON.parse(JSON.stringify(template)),
				config: config,
				errors: [],
				opts: {
					stage: 'database',
					group: 'steps',
					stepPath: 'tenant',
					section: 'tenant'
				}
			};
			context.template.content.tenant.data = [];
			utils.deploy(req, context, lib, async, BL, 'mongo', function (err, body) {
				done();
			});
		});
		
		it("success products with tenant entry already created", function (done) {
			context = {
				BL: BL,
				environmentRecord: environmentRecord,
				template: JSON.parse(JSON.stringify(template)),
				config: config,
				errors: [],
				opts: {
					stage: 'database',
					group: 'steps',
					stepPath: 'tenant',
					section: 'tenant'
				}
			};
			context.template.deploy.database.steps["tenant"].status = {
				done: false,
				data: [
					{
						name: "MIKE"
					},
					{
						name: "noMike"
					}
				]
			};
			utils.deploy(req, context, lib, async, BL, 'mongo', function (err, body) {
				done();
			});
		});
		
		it("success products with a package", function (done) {
			context = {
				BL: BL,
				environmentRecord: environmentRecord,
				template: JSON.parse(JSON.stringify(template)),
				config: config,
				errors: [],
				opts: {
					stage: 'database',
					group: 'steps',
					stepPath: 'tenant',
					section: 'tenant'
				}
			};
			delete context.template.deploy.database.steps["tenant"].status;
			utils.deploy(req, context, lib, async, BL, 'mongo', function (err, body) {
				done();
			});
		});
		
		it("success products with no package found", function (done) {
			lib = {
				initBLModel: function (module, modelName, cb) {
					return cb(null, {
						add: function (context, req, data, cb) {
							return cb(null, tenantRecord);
						},
						get: function (context, req, data, cb) {
							return cb(null, tenantRecord);
						},
						delete: function (context, req, data, cb) {
							return cb(null, true);
						},
						addApplication: function (context, req, data, cb) {
							return cb(null, true);
						},
						saveOAuth: function (context, code, message, req, data, cb) {
							return cb(null, true);
						},
						createApplicationKey: function (context, req, provision, data, cb) {
							return cb(null, true);
						},
						addApplicationExtKeys: function (context, soajsCore, req, data, cb) {
							return cb(null, true);
						},
						updateApplicationConfig: function (context, req, data, cb) {
							return cb(null, true);
						},
					});
				},
				checkReturnError: function (req, {}, {}, cb) {
					return cb(null, true);
				}
			};
			context = {
				BL: BL,
				environmentRecord: environmentRecord,
				template: JSON.parse(JSON.stringify(template)),
				config: config,
				errors: [],
				opts: {
					stage: 'database',
					group: 'steps',
					stepPath: 'tenant',
					section: 'tenant'
				}
			};
			utils.deploy(req, context, lib, async, BL, 'mongo', function (err, body) {
				done();
			});
		});
		
	});
	
	describe("testing rollback", function () {
		
		it("success tenants no status", function (done) {
			context = {
				BL: BL,
				environmentRecord: environmentRecord,
				template: JSON.parse(JSON.stringify(template)),
				config: config,
				errors: [],
				opts: {
					stage: 'database',
					group: 'steps',
					stepPath: 'tenant',
					section: 'tenant'
				}
			};
			delete context.template.deploy.database.steps["tenant"].status;
			utils.rollback(req, context, lib, async, BL, 'mongo', function (err, body) {
				done();
			});
		});
		
		it("success tenants not done", function (done) {
			context = {
				BL: BL,
				environmentRecord: environmentRecord,
				template: JSON.parse(JSON.stringify(template)),
				config: config,
				errors: [],
				opts: {
					stage: 'database',
					group: 'steps',
					stepPath: 'tenant',
					section: 'tenant'
				}
			};
			context.template.deploy.database.steps["tenant"].status = {
				done: false
			};
			utils.rollback(req, context, lib, async, BL, 'mongo', function (err, body) {
				done();
			});
		});
		
		it("success tenants ", function (done) {
			lib = {
				initBLModel: function (module, modelName, cb) {
					return cb(null, {
						model: {
							saveEntry: function (soajs, opts, cb) {
								return cb(null, true);
							},
						},
						add: function (context, req, data, cb) {
							return cb(null, tenantRecord);
						},
						get: function (context, req, data, cb) {
							return cb(null, tenantRecord);
						},
						delete: function (context, req, data, cb) {
							return cb(null, true);
						},
						addApplication: function (context, req, data, cb) {
							return cb(null, true);
						},
						saveOAuth: function (context, code, message, req, data, cb) {
							return cb(null, true);
						},
						createApplicationKey: function (context, req, provision, data, cb) {
							return cb(null, true);
						},
						addApplicationExtKeys: function (context, soajsCore, req, data, cb) {
							return cb(null, true);
						},
						updateApplicationConfig: function (context, req, data, cb) {
							return cb(null, true);
						},
					});
				},
				checkReturnError: function (req, {}, {}, cb) {
					return cb(null, true);
				}
			};
			context = {
				BL: BL,
				environmentRecord: environmentRecord,
				template: JSON.parse(JSON.stringify(template)),
				config: config,
				errors: [],
				opts: {
					stage: 'database',
					group: 'steps',
					stepPath: 'tenant',
					section: 'tenant'
				}
			};
			context.template.deploy.database.steps["tenant"].status = {
				done: true
			};
			utils.rollback(req, context, lib, async, BL, 'mongo', function (err, body) {
				done();
			});
		});
		
		it("success tenants with no entries", function (done) {
			context.template.content.tenant.data = [];
			utils.rollback(req, context, lib, async, BL, 'mongo', function (err, body) {
				done();
			});
		});
		
		it("success with tenant found", function (done) {
			context = {
				BL: BL,
				environmentRecord: environmentRecord,
				template: JSON.parse(JSON.stringify(template)),
				config: config,
				errors: [],
				opts: {
					stage: 'database',
					group: 'steps',
					stepPath: 'tenant',
					section: 'tenant'
				}
			};
			context.template.deploy.database.steps["tenant"].status = {
				done: true
			};
			lib = {
				initBLModel: function (module, modelName, cb) {
					return cb(null, {
						model: {
							saveEntry: function (soajs, opts, cb) {
								return cb(null, true);
							},
						},
						add: function (context, req, data, cb) {
							return cb(null, true);
						},
						get: function (context, req, data, cb) {
							return cb(null, tenantRecord);
						},
						delete: function (context, req, data, cb) {
							return cb(null, true);
						},
						addApplication: function (context, req, data, cb) {
							return cb(null, true);
						},
						saveOAuth: function (context, code, message, req, data, cb) {
							return cb(null, true);
						},
						createApplicationKey: function (context, req, provision, data, cb) {
							return cb(null, true);
						},
						addApplicationExtKeys: function (context, soajsCore, req, data, cb) {
							return cb(null, true);
						},
						updateApplicationConfig: function (context, req, data, cb) {
							return cb(null, true);
						},
					});
				},
				checkReturnError: function (req, {}, {}, cb) {
					return cb(null, true);
				}
			};
			mongoStub = {
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
					cb(true, true);
				},
				removeEntry: function (soajs, opts, cb) {
					cb(true, true);
				},
				closeConnection: function (soajs) {
					return true;
				}
			};
			BL = {
				customRegistry: {
					module: {}
				},
				model: mongoStub,
				cd: {
					module: {}
				},
				cloud: {
					deploy: {
						module: {}
					},
					services: {
						module: {}
					},
					resources: {
						module: {}
					}
				},
				resources: {
					module: {}
				},
				products: {
					module: {}
				},
				tenants: {
					module: {}
				}
			};
			utils.rollback(req, context, lib, async, BL, 'mongo', function (err, body) {
				done();
			});
		});
		
		it("success with no applications", function (done) {
			context = {
				BL: BL,
				environmentRecord: environmentRecord,
				template: JSON.parse(JSON.stringify(template)),
				config: config,
				errors: [],
				opts: {
					stage: 'database',
					group: 'steps',
					stepPath: 'tenant',
					section: 'tenant'
				}
			};
			context.template.deploy.database.steps["tenant"].status = {
				done: true
			};
			lib = {
				initBLModel: function (module, modelName, cb) {
					return cb(null, {
						model: {
							removeEntry: function (soajs, opts, cb) {
								return cb(null, true);
							},
						},
						add: function (context, req, data, cb) {
							return cb(null, true);
						},
						get: function (context, req, data, cb) {
							tenantRecord.applications.shift();
							return cb(null, tenantRecord);
						},
						delete: function (context, req, data, cb) {
							return cb(null, true);
						},
						addApplication: function (context, req, data, cb) {
							return cb(null, true);
						},
						saveOAuth: function (context, code, message, req, data, cb) {
							return cb(null, true);
						},
						createApplicationKey: function (context, req, provision, data, cb) {
							return cb(null, true);
						},
						addApplicationExtKeys: function (context, soajsCore, req, data, cb) {
							return cb(null, true);
						},
						updateApplicationConfig: function (context, req, data, cb) {
							return cb(null, true);
						},
					});
				},
				checkReturnError: function (req, {}, {}, cb) {
					return cb(null, true);
				}
			};
			mongoStub = {
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
					cb(true, true);
				},
				removeEntry: function (soajs, opts, cb) {
					cb(true, true);
				},
				closeConnection: function (soajs) {
					return true;
				}
			};
			BL = {
				customRegistry: {
					module: {}
				},
				model: mongoStub,
				cd: {
					module: {}
				},
				cloud: {
					deploy: {
						module: {}
					},
					services: {
						module: {}
					},
					resources: {
						module: {}
					}
				},
				resources: {
					module: {}
				},
				products: {
					module: {}
				},
				tenants: {
					module: {}
				}
			};
			utils.rollback(req, context, lib, async, BL, 'mongo', function (err, body) {
				done();
			});
		});
	});
});
