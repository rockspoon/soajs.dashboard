'use strict';
const fs = require("fs");
const utils = require("../../../utils/utils.js");
const async = require("async");
const infraColname = 'infra';
const serviceModel = require("../../../models/services.js");
function checkIfError(soajs, mainCb, data, cb) {
	utils.checkErrorReturn(soajs, mainCb, data, cb);
}

var BL = {
	model: null,
	
	/**
	 * Scale a deployed service (SOAJS content or custom)
	 *
	 * @param  {Object}   config
	 * @param  {Object}   soajs
	 * @param  {Object}   deployer
	 * @param  {Function} cbMain
	 */
	"scaleService": function (config, soajs, deployer, cbMain) {
		async.auto({
			"getEnvironment": (mCb) => {
				utils.getEnvironment(soajs, BL.model, soajs.inputmaskData.env.toUpperCase(), (error, envRecord) => {
					checkIfError(soajs, mCb, {config: config, error: error || !envRecord, code: 600}, () => {
						return mCb(null, envRecord);
					});
				});
			},
			"callDeployer": ["getEnvironment", (info, mCb) => {
				let options = utils.buildDeployerOptions(info.getEnvironment, soajs, BL, null);
				options.params = {
					id: soajs.inputmaskData.serviceId,
					scale: soajs.inputmaskData.scale
				};
				deployer.execute({
					'type': 'container',
					'driver': options.strategy
				}, 'scaleService', options, (error) => {
					checkIfError(soajs, mCb, {config: config, error: error}, mCb);
				});
			}]
		}, (error) => {
			checkIfError(soajs, cbMain, {config: config, error: error, code: (error) ? error.code : 600}, function () {
				return cbMain(null, true); //  @mike, plz confirm
			});
		});
	},
	
	/**
	 * Delete a deployed service (SOAJS content or custom)
	 * @param  {Object}   config
	 * @param  {Object}   req
	 * @param  {Object}   deployer
	 * @param  {Function} cbMain
	 */
	"deleteService": function (config, req, deployer, cbMain) {
		async.auto({
			"getEnvironment": (mCb) => {
				utils.getEnvironment(req.soajs, BL.model, req.soajs.inputmaskData.env.toUpperCase(), (error, envRecord) => {
					checkIfError(req.soajs, mCb, {config: config, error: error || !envRecord, code: 600}, () => {
						if (req.soajs.inputmaskData.technology === "vm" && envRecord.restriction && Object.keys(envRecord.restriction).length > 0) {
							req.soajs.inputmaskData.infraId = Object.keys(envRecord.restriction)[0];
						}
						return mCb(null, envRecord);
					});
				});
			},
			"getInfra": ["getEnvironment", (results, mCb) => {
				checkIfError(req.soajs, mCb, {
					config: config,
					error: req.soajs.inputmaskData.technology === "vm" && !req.soajs.inputmaskData.infraId,
					code: 520
				}, () => {
					if (req.soajs.inputmaskData.infraId) {
						req.soajs.inputmaskData.id = req.soajs.inputmaskData.infraId;
						BL.model.validateId(req.soajs, (err) => {
							checkIfError(req.soajs, mCb, {config: config, error: err, code: 490}, () => {
								let opts = {
									collection: infraColname,
									conditions: {
										_id: req.soajs.inputmaskData.id
									}
								};
								BL.model.findEntry(req.soajs, opts, function (err, infraRecord) {
									checkIfError(req.soajs, mCb, {config: config, error: err, code: 600}, () => {
										checkIfError(req.soajs, mCb, {
											config: config,
											error: !infraRecord,
											code: 600
										}, () => {
											return mCb(null, infraRecord);
										});
									});
								});
							});
						});
					} else {
						let opts = {
							collection: infraColname,
							conditions: {
								"deployments.environments": {"$in": [req.soajs.inputmaskData.env.toUpperCase()]}
							}
						};
						BL.model.findEntry(req.soajs, opts, function (err, infraRecord) {
							checkIfError(req.soajs, mCb, {config: config, error: err, code: 600}, () => {
								checkIfError(req.soajs, mCb, {config: config, error: !infraRecord, code: 600}, () => {
									return mCb(null, infraRecord);
								});
							});
						});
					}
				});
			}],
			"callDeployer": ["getEnvironment", "getInfra", (info, mCb) => {
				let options = utils.buildDeployerOptions(info.getEnvironment, req.soajs, BL);
				options.infra = info.getInfra;
				//need to supply the stack if infra has more than drivers
				
				let infraInfo = utils.getDeploymentFromInfra(options.infra, info.getEnvironment.code);
				options.infra.info = infraInfo;
				let technology = req.soajs.inputmaskData.technology || options.strategy;
				checkIfError(req.soajs, mCb, {
					config: config,
					error: technology !== "vm" && !options.infra.stack && (!infraInfo || !Array.isArray(infraInfo) || infraInfo.length === 0),
					code: 497
				}, () => {
					let infraId = req.soajs.inputmaskData.infraId;
					checkIfError(req.soajs, cbMain, {
						config: config,
						error: technology === "vm" && (!info.getEnvironment.restriction[infraId]
							|| !Object.keys(info.getEnvironment.restriction[infraId]).length > 0
							|| !info.getEnvironment.restriction[infraId][Object.keys(result.getEnvironment.restriction[infraId])[0]]),
						code: 520
					}, () => {
						options.infra.stack = infraInfo ? infraInfo[0] : null;
						options.params = {
							id: req.soajs.inputmaskData.serviceId,
							mode: req.soajs.inputmaskData.mode
						};
						
						if (technology === "vm") {
							options.params.region = Object.keys(info.getEnvironment.restriction[infraId])[0];
							options.params.group = info.getEnvironment.restriction[infraId][options.params.region].group;
						}
						deployer.execute({
							'type': 'infra',
							'driver': info.getInfra.name,
							'technology': technology
						}, 'deleteService', options, (error) => {
							if (error) {
								req.soajs.log.error(error);
							} else {
								//once service is deleted, if options.infra contains a stack entry
								if (options.infra.stack) {
									delete options.infra.stack;
									delete options.infra.info;
									BL.model.saveEntry(req.soajs, {
										collection: 'infra',
										record: options.infra
									}, (error) => {
										if (error) {
											req.soajs.log.error(error);
										}
									});
								}
							}
						});
						return mCb();
					});
				});
			}]
		}, (error) => {
			if (error) {
				req.soajs.log.error(error);
			}
			checkIfError(req.soajs, cbMain, {
				config: config,
				error: error,
				code: (error) ? error.code : 600
			}, function () {
				return cbMain(null, true);
			});
		});
	},
	
	/**
	 * Check if resource is deployed
	 * @param  {Object}   config
	 * @param  {Object}   soajs
	 * @param  {Object}   deployer
	 * @param  {Function} cbMain
	 *
	 */
	"checkResource": function (config, soajs, deployer, cbMain) {
		let deployed = false;
		async.auto({
			"getEnvironment": (mCb) => {
				utils.getEnvironment(soajs, BL.model, soajs.inputmaskData.env.toUpperCase(), (error, envRecord) => {
					checkIfError(soajs, mCb, {config: config, error: error || !envRecord, code: 600}, () => {
						return mCb(null, envRecord);
					});
				});
			},
			"callDeployer": ["getEnvironment", (info, mCb) => {
				let options = utils.buildDeployerOptions(info.getEnvironment, soajs, BL);
				options.params = {
					id: soajs.inputmaskData.serviceId,
					scale: soajs.inputmaskData.scale
				};
				deployer.execute({
					'type': 'container',
					'driver': options.strategy
				}, 'listKubeServices', options, (error, services) => {
					checkIfError(soajs, mCb, {config: config, error: error}, () => {
						async.detect(services, (oneService, callback) => {
							return callback(null, oneService && oneService.metadata && oneService.metadata.name === soajs.inputmaskData.resource && oneService.metadata.namespace === soajs.inputmaskData.namespace);
						}, (error, service) => {
							//no error to be handled
							deployed = !!(service && Object.keys(service).length > 0);
							return mCb(null, true);
						});
					});
				});
			}]
		}, (error) => {
			checkIfError(soajs, cbMain, {config: config, error: error, code: (error) ? error.code : 600}, () => {
				return cbMain(null, {"deployed": deployed});
			});
		});
	},
	
	/**
	 * List all deployed services from cluster, SOAJS content + custom deployments/services
	 *
	 * @param  {Object}   config
	 * @param  {Object}   soajs
	 * @param  {Object}   deployer
	 * @param  {Function} cbMain
	 */
	"listServices": function (config, soajs, deployer, cbMain) {
		async.auto({
			"getEnvironment": (mCb) => {
				utils.getEnvironment(soajs, BL.model, soajs.inputmaskData.env.toUpperCase(), (error, envRecord) => {
					checkIfError(soajs, mCb, {config: config, error: error || !envRecord, code: 600}, () => {
						return mCb(null, envRecord);
					});
				});
			},
			"listServices": (mCb) => {
				let opts = {};
				serviceModel.findEntries(soajs, BL.model, opts, function (error, records) {
					checkIfError(soajs, mCb, {config: config, error: error}, () => {
						return mCb(null, records);
					});
				});
			},
			"getInfra": (mCb) => {
				let opts = {
					collection: infraColname,
					conditions: {
						"deployments.environments": {"$in": [soajs.inputmaskData.env.toUpperCase()]}
					}
				};
				BL.model.findEntry(soajs, opts, function (err, infraRecord) {
					checkIfError(soajs, mCb, {config: config, error: err}, () => {
						checkIfError(soajs, mCb, {config: config, error: !infraRecord, code: 600}, () => {
							return mCb(null, infraRecord);
						});
					});
				});
			},
			"callDeployer": ["getEnvironment", "getInfra", "listServices", (info, mCb) => {
				let options = utils.buildDeployerOptions(info.getEnvironment, soajs, BL);
				options.infra = info.getInfra;
				//need to supply the stack if infra has more than drivers
				options.infra.stack = utils.getDeploymentFromInfra(options.infra, info.getEnvironment.code)[0];
				
				async.series({
					"getEnvServices": (vCb) => {
						options.params = {env: soajs.inputmaskData.env.toLowerCase()};
						deployer.execute({
							'type': 'infra',
							'driver': info.getInfra.name,
							'technology': options.strategy
						}, 'listServices', options, vCb);
					},
					"getCustomServices": (vCb) => {
						options.params = {custom: true};
						deployer.execute({
							'type': 'infra',
							'driver': info.getInfra.name,
							'technology': options.strategy
						}, 'listServices', options, vCb);
					}
				}, mCb);
			}]
		}, (error, results) => {
			checkIfError(soajs, cbMain, {config: config, error: error}, () => {
				let services = results.callDeployer.getEnvServices;
				let customServices = results.callDeployer.getCustomServices;
				let serviceDb = results.listServices;
				
				if (!services) services = [];
				if (customServices && customServices.length > 0) {
					services = services.concat(customServices);
				}
				
				let blackList = config.HA.blacklist;
				if (soajs.servicesConfig && soajs.servicesConfig.dashboard && soajs.servicesConfig.dashboard.HA && soajs.servicesConfig.dashboard.HA.blacklist) {
					blackList = soajs.servicesConfig.dashboard.HA.blacklist;
				}
				//add command to each service
				async.each(services, (oneService, call) => {
					if (oneService.env) {
						for (let e = 0; e < oneService.env.length; e++) {
							let envName = oneService.env[e].split("=")[0];
							if (blackList.indexOf(envName.toLowerCase()) !== -1) {
								oneService.env[e] = envName + "=******************";
							}
						}
					}
					async.each(serviceDb, (oneServiceDB, callback) => {
						if (oneService.labels && oneService.labels["soajs.service.name"] && oneServiceDB.name === oneService.labels["soajs.service.name"]) {
							oneService.maintenance = oneServiceDB.maintenance;
						}
						return callback();
					}, call);
				}, () => {
					return cbMain(null, services);
				});
			});
		});
	}
};

module.exports = {
	"init": function (modelName, cb) {
		var modelPath;
		
		if (!modelName) {
			return cb(new Error("No Model Requested!"));
		}
		
		modelPath = __dirname + "/../../../models/" + modelName + ".js";
		return requireModel(modelPath, cb);
		
		/**
		 * checks if model file exists, requires it and returns it.
		 * @param filePath
		 * @param cb
		 */
		function requireModel(filePath, cb) {
			//check if file exist. if not return error
			fs.exists(filePath, function (exists) {
				if (!exists) {
					return cb(new Error("Requested Model Not Found!"));
				}
				
				BL.model = require(filePath);
				return cb(null, BL);
			});
		}
	}
};
