"use strict";
var assert = require('assert');
var request = require("request");
var soajs = require('soajs');
var helper = require("../helper.js");
var shell = require('shelljs');
var controller, dashboard;

var config = helper.requireModule('./service/config');
var errorCodes = config.errors;

var Mongo = soajs.mongo;
var dbConfig = require("./db.config.test.js");

var dashboardConfig = dbConfig();
dashboardConfig.name = "core_provision";
var mongo = new Mongo(dashboardConfig);

var sampleData = require("soajs.mongodb.data/modules/dashboard");

var extKey = 'aa39b5490c4a4ed0e56d7ec1232a428f771e8bb83cfcee16de14f735d0f5da587d5968ec4f785e38570902fd24e0b522b46cb171872d1ea038e88328e7d973ff47d9392f72b2d49566209eb88eb60aed8534a965cf30072c39565bd8d72f68ac';

function executeMyRequest(params, apiPath, method, cb) {
	requester(apiPath, method, params, function(error, body) {
		assert.ifError(error);
		assert.ok(body);
		return cb(body);
	});

	function requester(apiName, method, params, cb) {
		var options = {
			uri: 'http://localhost:4000/dashboard/' + apiName,
			headers: {
				'Content-Type': 'application/json',
				key: extKey
			},
			json: true
		};

		if(params.headers) {
			for(var h in params.headers) {
				if(params.headers.hasOwnProperty(h)) {
					options.headers[h] = params.headers.h;
				}
			}
		}

		if(params.form) {
			options.body = params.form;
		}

		if(params.qs) {
			options.qs = params.qs;
		}
		request[method](options, function(error, response, body) {
			assert.ifError(error);
			assert.ok(body);
			return cb(null, body);
		});
	}
}

describe("importing sample data", function() {
	before(function(done){
		mongo.dropDatabase(function(error){
			assert.ifError(error);
			done();
		});
	});

	it("do import", function(done) {
		shell.pushd(sampleData.dir);
		shell.exec("chmod +x " + sampleData.shell, function(code) {
			assert.equal(code, 0);
			shell.exec(sampleData.shell, function(code) {
				assert.equal(code, 0);
				shell.popd();
				done();
			});
		});
	});
	
	after(function(done) {
		console.log('test data imported.');
		controller = require("soajs.controller");
		dashboard = helper.requireModule('./service/index');
		console.log('starting tests ....');
		setTimeout(function() {
			done();
		}, 2000);
	});

});

describe("DASHBOARD UNIT TESTS for locked", function() {
	var expDateValue = new Date().toISOString();
	var envId;
	describe("environment tests", function() {		
		before(function(done){
			mongo.findOne('environment', {'code': 'DEV'}, function(error, record) {
				assert.ifError(error);
				assert.ok(record);
				envId = record._id.toString();
				done();	
			});			
		});

		describe("delete environment tests", function() {
			it("FAIL locked - cant delte environment", function(done) {
				var params = {
					qs: {'id': envId}
				};
				executeMyRequest(params, 'environment/delete', 'get', function(body) {
					assert.ok(body);
					console.log(JSON.stringify(body));
					assert.deepEqual(body.errors.details[0], {"code": 500, "message": "This record is locked. You cannot delete it"});
					done();					
				});
			});
		});

	});

	describe("products tests", function() {
		var productId;
		before(function(done){
			mongo.findOne('products', {'code': 'DSBRD'}, function(error, record) {
				assert.ifError(error);
				productId = record._id.toString();	
				done();	
			});
		});
		
		describe("product", function() {
			it("Fail - locked. Cant update product", function(done) {					
				var params = {
					qs: {'id': productId},
					form: {
						"description": 'this is a dummy updated description',
						"name": "test product updated"
					}
				};
				executeMyRequest(params, 'product/update', 'post', function(body) {
					assert.ok(body);
					console.log(JSON.stringify(body));
					assert.deepEqual(body.errors.details[0], 
							{"code": 501, "message": "This record is locked. You cannot modify or delete it"});						
					done();
				});
			
			});


			it("Fail - locked - delete product", function(done) {
				var params = {
					qs: {'id': productId}
				};
				executeMyRequest(params, 'product/delete', 'get', function(body) {
					assert.ok(body);
					console.log(JSON.stringify(body));
					assert.deepEqual(body.errors.details[0], 
							{"code": 501, "message": "This record is locked. You cannot modify or delete it"});						
					done();
				});
			});
		

		});

		describe("package", function() {
			it("FAIL - locked. cant add package", function(done) {
				var params = {
					qs: {'id': productId},
					form: {
						"code": "BSIC",
						"name": "basic package",
						"description": 'this is a dummy description',
						"_TTL": '12',
						"acl": {
							"urac": {}
						}
					}
				};
				executeMyRequest(params, 'product/packages/add', 'post', function(body) {
					assert.ok(body);
					console.log(JSON.stringify(body));
					assert.deepEqual(body.errors.details[0], 
							{"code": 501, "message": "This record is locked. You cannot modify or delete it"});					
					done();
				});
			});

			it("FAIL - locked. cant update package", function(done) {
				var params = {
					qs: {'id': productId, "code": "DEFLT"},
					form: {
						"name": "basic package 2",
						"description": 'this is a dummy updated description',
						"_TTL": '24',
						"acl": {
							"urac": {}
						}
					}
				};
				executeMyRequest(params, 'product/packages/update', 'post', function(body) {
					assert.ok(body);
					console.log(JSON.stringify(body));
					assert.deepEqual(body.errors.details[0], {"code": 501, "message": "This record is locked. You cannot modify or delete it"});
					done();
				});
			});

			it("FAIL - locked. cant delete package", function(done) {
				var params = {
					qs: {"id": productId, 'code': 'DEFLT'}
				};
				executeMyRequest(params, 'product/packages/delete', 'get', function(body) {
					assert.ok(body);
					console.log(JSON.stringify(body));	
					assert.deepEqual(body.errors.details[0], {"code": 501, "message": "This record is locked. You cannot modify or delete it"});
					done();
				});
			});

		});
	});

	describe("tenants tests", function() {
		var tenantId, applicationId, key;
		var appExtKey;
		describe("tenant", function() {
			it('mongo test', function(done) {
				mongo.findOne('tenants', {'code': 'DBTN'}, function(error, tenantRecord) {
					assert.ifError(error);
					tenantId = tenantRecord._id.toString();					
					console.log(JSON.stringify(tenantRecord));						
					applicationId = tenantRecord.applications[0].appId.toString();
					key = tenantRecord.applications[0].keys[0].key;
					console.log( ' ********** tenantRecord.applications[0].keys[0].extKeys' );
					console.log( tenantRecord.applications[0].keys[0].extKeys[0].extKey );
					appExtKey=tenantRecord.applications[0].keys[0].extKeys[0].extKey ; 
					done();	
				});
			
			});

			it("FAIL - locked. - cant update tenant", function(done) {
				var params = {
					qs: {"id": tenantId},
					form: {
						"description": 'this is a dummy updated description',
						"name": "test tenant updated"
					}
				};
				executeMyRequest(params, 'tenant/update', 'post', function(body) {
					assert.ok(body);
					done();
				});
				
			});

			it("FAIL - locked. cant delete tenant", function(done) {
				executeMyRequest({'qs': {id: tenantId}}, 'tenant/delete/', 'get', function(body) {
					assert.ok(body);
					console.log(JSON.stringify(body));		
					assert.deepEqual(body.errors.details[0], 
							{"code": 501, "message": "This record is locked. You cannot modify or delete it"});					
					done();
				});
			});

		});

		describe("oauth", function() {

			it("FAIL - locked. cant add oauth", function(done) {
				var params = {
					qs: {
						'id': tenantId
					},
					form: {
						"secret": "my secret key",
						"redirectURI": "http://www.myredirecturi.com/"
					}
				};
				executeMyRequest(params, 'tenant/oauth/add/', 'post', function(body) {
					assert.ok(body);
					console.log(JSON.stringify(body));	
					assert.deepEqual(body.errors.details[0], {"code": 501, "message": "This record is locked. You cannot modify or delete it"});						
					done();
				});
			});
			it("FAIL - locked. cant update oauth", function(done) {
				var params = {
					qs: {id: tenantId},
					form: {
						"secret": "my secret key",
						"redirectURI": "http://www.myredirecturi.com/"
					}
				};
				executeMyRequest(params, 'tenant/oauth/update/', 'post', function(body) {
					assert.ok(body);
					console.log(JSON.stringify(body));	
					assert.deepEqual(body.errors.details[0], {"code": 501, "message": "This record is locked. You cannot modify or delete it"});						
					done();
				});
			});

			it("FAIL - locked. - cant delete oauth", function(done) {
				executeMyRequest({qs: {id: tenantId}}, 'tenant/oauth/delete/', 'get', function(body) {
					assert.ok(body);
					console.log(JSON.stringify(body));	
					assert.deepEqual(body.errors.details[0], {"code": 501, "message": "This record is locked. You cannot modify or delete it"});						
					done();
				});
			});

		});

		describe("applications", function() {

			describe("add applications tests", function() {
				it("FAIL - locked. - cant add application", function(done) {
					var params = {
						qs: {'id': tenantId},
						form: {
							"productCode": "TPROD",
							"packageCode": "BASIC",
							"description": "this is a dummy description",
							"_TTL": '12'
						}
					};
					executeMyRequest(params, 'tenant/application/add', 'post', function(body) {
						assert.ok(body);
						console.log(JSON.stringify(body));
						assert.deepEqual(body.errors.details[0], 
								{"code": 501, "message": "This record is locked. You cannot modify or delete it"});						
						done();
					});
				});

			});

			describe("update applications tests", function() {
				it("FAIL - locked. - cant update application", function(done) {
					var params = {
						qs: {'id': tenantId, 'appId': applicationId},
						form: {
							"productCode": "DSBRD",
							"packageCode": "DEFLT",
							"description": "this is a dummy description updated",
							"_TTL": '24',
							"acl": {
								"urac": {}
							}
						}
					};
					executeMyRequest(params, 'tenant/application/update', 'post', function(body) {
						assert.ok(body);
						console.log(JSON.stringify(body));	
						assert.deepEqual(body.errors.details[0], 
								{"code": 501, "message": "This record is locked. You cannot modify or delete it"});						
						done();
					});
				});

			});

			describe("delete applications tests", function() {

				it("FAIL - locked. - will delete application", function(done) {
					executeMyRequest({qs: {'id': tenantId, 'appId': applicationId}}, 'tenant/application/delete/', 'get', function(body) {
						assert.ok(body);
						console.log(JSON.stringify(body));
						assert.deepEqual(body.errors.details[0], 
								{"code": 501, "message": "This record is locked. You cannot modify or delete it"});						
						done();
					});
				});

			});


		});

		describe("application keys", function() {
			describe("add application keys", function() {
				it("FAIL - cant add key", function(done) {
					var params = {
						qs: {
							'id': tenantId,
							'appId': applicationId
						}
					};
					console.log( params );	
					executeMyRequest(params, 'tenant/application/key/add', 'post', function(body) {
						assert.ok(body);
						console.log(JSON.stringify(body));	
						assert.deepEqual(body.errors.details[0], 
								{"code": 501, "message": "This record is locked. You cannot modify or delete it"});						
						done();
					});
				});

			});

			describe("delete application keys", function() {
				it("FAIL - cant delete key", function(done) {
					var params = {
						qs: {
							'id': tenantId,
							'appId': applicationId,
							'key': key.toString()
						}
					};
					executeMyRequest(params, 'tenant/application/key/delete', 'get', function(body) {
						assert.ok(body);
						console.log(JSON.stringify(body));	
						assert.deepEqual(body.errors.details[0], 
								{"code": 501, "message": "This record is locked. You cannot modify or delete it"});						
						done();
					});
				});

			});

		});

		describe("application ext keys", function() {
			
			describe("add application ext keys", function() {
				it("FAIL - cant add ext key", function(done) {
					var params = {
						qs: {
							id: tenantId,
							appId: applicationId,
							key: key
						},
						form: {
							'expDate': expDateValue,
							'device': {},
							'geo': {}
						}
					};
					executeMyRequest(params, 'tenant/application/key/ext/add/', 'post', function(body) {
						console.log(JSON.stringify(body));
						assert.ok(body);
						assert.deepEqual(body.errors.details[0], 
								{"code": 501, "message": "This record is locked. You cannot modify or delete it"});						
						done();
					});
				});

			});

			describe("update application ext keys", function() {
				it("FAIL - cant update ext key", function(done) {
					var params = {
						qs: {
							id: tenantId,
							appId: applicationId,
							key: appExtKey
						},
						form: {
							'extKey': appExtKey,
							'expDate': expDateValue,
							'device': {},
							'geo': {}
						}
					};
					executeMyRequest(params, 'tenant/application/key/ext/update/', 'post', function(body) {
						assert.ok(body);
						console.log(JSON.stringify(body));	
						assert.deepEqual(body.errors.details[0], 
								{"code": 501, "message": "This record is locked. You cannot modify or delete it"});						
						done();
					});
				});

			});

			describe("delete application ext keys", function() {
				it("FAIL - cant delete ext key", function(done) {
					var params = {
						qs: {
							id: tenantId,
							appId: applicationId,
							key: key
						},
						form: {
							'extKey': appExtKey
						}
					};
					executeMyRequest(params, 'tenant/application/key/ext/delete/', 'post', function(body) {
						assert.ok(body);
						console.log(JSON.stringify(body));	
						assert.deepEqual(body.errors.details[0], 
								{"code": 501, "message": "This record is locked. You cannot modify or delete it"});						
						done();
					});
				});
			});


		});

		describe("application config", function() {
			describe("update application config", function() {
				it("FAIL - cant update configuration", function(done) {
					var params = {
						qs: {
							id: tenantId,
							appId: applicationId,
							key: key
						},
						form: {
							'envCode': 'DEV',
							'config': {}
						}
					};
					executeMyRequest(params, 'tenant/application/key/config/update', 'post', function(body) {
						assert.ok(body);						
						console.log(' applicationId: ' + applicationId );
						console.log(' key: ' + key );						
						done();
					});
				});

			});

		});
	});


});