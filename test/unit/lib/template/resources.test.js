"use strict";

const assert = require("assert");
const fs = require("fs");
const request = require("request");

const helper = require("../../../helper.js");
const coreModules = require("soajs.core.modules");
const core = coreModules.core;
const async = require('async');
let template = require('./schema/template.js');
const resIndex = helper.requireModule('./lib/templates/drivers/resources.js');

let mongoStub = {
	model: {
		checkForMongo: function (soajs) {
			return true;
		},
		validateId: function (soajs, cb) {
			return cb(null, soajs.inputmaskData.id);
		},
		findEntries: function (soajs, opts, cb) {
			let ciRecord = {
				"_id": '5aba44f1ad30ac676a02d650',
				"provider": "travis",
				"type": "recipe",
				"name": "My Custom Recipe",
				"recipe": "sudo something",
				"sha": "1234"
			};
			if (opts.collection === 'environment') {
				let environments = [
					{
						"code": "DASHBOARD"
					}, {
						"code": "DEV"
					}
				];
				cb(null, environments);
			} else {
				return cb(null, ciRecord);
				// todo if needed
			}
		},
		findEntry: function (soajs, opts, cb) {
			if (opts.collection === 'services') {
				let originalServiceRecord = {
					name: 'test',
					src: {
						repo: 'test',
						owner: 'test'
					}
				};
				cb(null, originalServiceRecord);
			} else {
				cb(); // todo if needed
			}
			
		},
		updateEntry: function (soajs, opts, cb) {
			cb(null, true);
		},
		removeEntry: function (soajs, opts, cb) {
			cb(null, true);
		},
		saveEntry: function (soajs, opts, cb) {
			cb(null, true);
		},
		initConnection: function (soajs) {
			return true;
		},
		closeConnection: function (soajs) {
			return true;
		},
		validateCustomId: function (soajs) {
			return true;
		},
		countEntries: function (soajs, opts, cb) {
			return cb(null, true);
		},
		find: function (soajs, opts, cb) {
			return cb(null, [{
				"_id": '5aba44f1ad30ac676a02d650',
				"provider": "travis",
				"type": "recipe",
				"name": "My Custom Recipe",
				"recipe": "sudo something",
				"locked": true,
				"sha": "1234"
			}]);
		},
		getDb: function (data) {
			return {
				ObjectId: function () {
					return ['123qwe'];
				}
			};
		}
	},
	
};
let req = {};
let context = {
	config: {
		schema: {
			post: {}
		}
	},
	template: template,
	errors: [],
	dbData: {},
};

let resModel = {
	addRecipe: function (context, opts, cb) {
		return cb(null, true);
	}
};

const lib = {
	initBLModel: function (module, cb) {
		return cb(null, resModel);
	},
	checkReturnError: function (req, mainCb, data, cb) {
		if (data.error) {
			if (typeof (data.error) === 'object') {
				req.soajs.log.error(data.error);
			}
			return mainCb({"code": data.code, "msg": data.config.errors[data.code]});
		} else {
			if (cb) {
				return cb();
			}
		}
	}
};

req.soajs = {};
req.soajs.validator = core.validator;


describe("Testing productization", function () {
	
	it("Success - check resources -- valid template", function (done) {
		resIndex.check(req, context, lib, async, mongoStub, function (result, error) {
			done();
		});
	});
	
	it("Fail - Check resources - invalid template", function (done) {
		req.soajs.validator = {
			Validator: function () {
				return {
					validate: function () {
						return {
							errors: ["errooorrr"],
						};
					}
				};
			}
		};
		resIndex.check(req, context, lib, async, mongoStub, function (result, error) {
			done();
		});
	});
	
	it("Success - Check resources - no productization record", function (done) {
		let newContext = JSON.parse(JSON.stringify(context));
		newContext.template.content.deployments.resources = {};
		resIndex.check(req, newContext, lib, async, mongoStub, function (result, error) {
			done();
		});
	});
});
