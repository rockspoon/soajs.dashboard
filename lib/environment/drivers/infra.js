"use strict";
const soajsUtils = require("soajs").utils;
const deployer = require("soajs.core.drivers");

function invokeAndCheck3rdPartyCall(req, context, infraModule, oneStep, counter, callback) {
	generateAndRunRequest(req, context, infraModule, oneStep, function (error, response) {
		if (error) {
			return callback(error);
		}

		let valid = true;
		let errors = [];

		if (!response) {
			valid = false;
		}
		else if (oneStep.check) {
			req.soajs.log.debug("comparing 3rd party response with check rules:", response, oneStep.check);
			let myValidator = new req.soajs.validator.Validator();
			let status = myValidator.validate(response, oneStep.check);
			if (status.errors && status.errors.length > 0) {
				valid = false;
				status.errors.forEach(function (err) {
					errors.push(err.stack);
				});
			}
		}

		if (valid) {
			return callback(null, response);
		}
		else {
			let finalError = new Error(JSON.stringify(errors));
			if (oneStep.recursive) {
				if (oneStep.recursive.max === counter) {
					return callback(finalError);
				}
				else {
					counter++;
					setTimeout(() => {
						invokeAndCheck3rdPartyCall(req, context, infraModule, oneStep, counter, callback);
					}, oneStep.recursive.delay);
				}
			}
			else {
				return callback(finalError);
			}
		}
	});
}

function generateAndRunRequest(req, context, infraModule, oneEntry, cb) {
	let command = oneEntry.command;
	if (!command) {
		return cb(new Error("Invalid or Missing information to invoke infra driver"));
	}

	let entryOptions = soajsUtils.cloneObj(oneEntry.options);
	switch (oneEntry.command) {
		case 'onboardVM':
			//req.soajs.log.info('onboard VM');
			//req.soajs.log.info(oneEntry);
			oneEntry.check = {
				"type": "boolean",
				required: true
			};
			entryOptions = JSON.parse(JSON.stringify(oneEntry.options.params));
			if (oneEntry.options.data) {
				for (let i in oneEntry.options.data) {
					entryOptions[i] = oneEntry.options.data[i];
				}
			}
			break;
		case 'deployCluster':
			oneEntry.check = {
				"type": "object",
				"properties": {
					id: {
						type: "string",
						required: true
					}
				}
			};
			break;
		case 'getDeployClusterStatus':
			oneEntry.recursive = {
				"max": 10,
				"delay": 2 * 60 * 1000
			};
			oneEntry.check = {
				"type": "object",
				"properties": {
					"id": {
						"type": "string",
						"required": true
					},
					"ip": {
						"type": "string",
						"required": true
					}
				}
			};
			break;
		case 'getDNSInfo':
			oneEntry.recursive = {
				"max": 10,
				"delay": 60 * 1000
			};
			oneEntry.check = {
				"type": "object",
				"properties": {
					"id": {
						"type": "string",
						"required": true
					},
					"dns": {
						"type": "object",
						"required": true
					}
				}
			};
			break;
		case 'deployVM':
			oneEntry.recursive = {
				"max": 10,
				"delay": 2 * 60 * 1000
			};
			oneEntry.check = {
				"type": "object",
				"properties": {
					id: {
						type: "string",
						required: true
					},
					name: {
						type: "string",
						required: true
					},
					infraId: {
						type: "string",
						required: true
					}
				}
			};
			entryOptions = JSON.parse(JSON.stringify(oneEntry.options.params));
			if (oneEntry.options.data) {
				for (let i in oneEntry.options.data) {
					entryOptions[i] = oneEntry.options.data[i];
				}
			}
			break;
		case 'getDeployVMStatus':
			oneEntry.recursive = {
				"max": 15,
				"delay": 2 * 60 * 1000
			};
			oneEntry.check = {
				"type": "object",
				"properties": {
					id: {
						type: "string",
						required: true
					},
					name: {
						type: "string",
						required: true
					},
					infraId: {
						type: "string",
						required: true
					}
				}
			};
			entryOptions = JSON.parse(JSON.stringify(oneEntry.options.params));
			if (oneEntry.options.data) {
				for (let i in oneEntry.options.data) {
					entryOptions[i] = oneEntry.options.data[i];
				}
			}
			break;
		case 'releaseVM':
			//req.soajs.log.info('release VM');
			//req.soajs.log.info(oneEntry);
			entryOptions = JSON.parse(JSON.stringify(oneEntry.options.params));
			if (oneEntry.options.data) {
				for (let i in oneEntry.options.data) {
					entryOptions[i] = oneEntry.options.data[i];
				}
			}
			entryOptions.release = true;
			oneEntry.command = "onboardVM";
			break;
		case 'destroyVM':
			entryOptions = JSON.parse(JSON.stringify(oneEntry.options.params));
			break;
	}

	//when using vm and container, store the container infra provider
	let existingProvider = soajsUtils.cloneObj(context.infraProvider);
	if (['deployVM', 'getDeployVMStatus', 'onboardVM'].indexOf(oneEntry.command) !== -1 && entryOptions && (!existingProvider || (existingProvider._id.toString() !== entryOptions.infraId))) {
		
		entryOptions.infraId = Object.keys(context.environmentRecord.restriction)[0];
		//get the infra to use for this vm deployment
		context.BL.model.findEntry(req.soajs, {
			"collection": "infra",
			"_id": context.BL.model.validateCustomId(req.soajs, entryOptions.infraId) //still looking for infra id in the inputs of vm
		}, (error, infraRecord) => {
			if (error) {
				return cb(error);
			}
			if (!infraRecord) {
				return cb(new Error("No Infra Provider found for id: ", entryOptions.infraId));
			}
			context.infraProvider = infraRecord;
			makeTheCall();
		});
	}
	//container cluster to provision, proceed normally
	else {
		makeTheCall();
	}

	//execute the request
	function makeTheCall() {
		req.soajs.log.info('start make TheCall');
		let soajs_project_imfv = (req.soajs.inputmaskData)? req.soajs.inputmaskData.soajs_project : null;
		let resumeDeployment = (req.soajs.inputmaskData)? req.soajs.inputmaskData.resume : false;
		req.soajs.inputmaskData = entryOptions || {};
		req.soajs.inputmaskData.resume = resumeDeployment;
		
		
		//update the inputs based on the command requested before invoking 3rd party modules
		if (['deployVM'].indexOf(oneEntry.command) !== -1) {
			req.soajs.inputmaskData.layerName = req.soajs.inputmaskData.name;
			req.soajs.inputmaskData.specs.layerName = req.soajs.inputmaskData.name;
			req.soajs.inputmaskData.wizard = true;
		}
		else if (['getDeployVMStatus', 'destroyVM'].indexOf(oneEntry.command) !== -1) {
			if (!req.soajs.inputmaskData.layerName) {
				req.soajs.inputmaskData.layerName = req.soajs.inputmaskData.name;
			}
			req.soajs.inputmaskData.wizard = true;
		}
		else {
			req.soajs.inputmaskData.id = context.infraProvider._id.toString(); //infraProviderId
			req.soajs.inputmaskData.driver = context.infraProvider.name; //infraProviderName
			req.soajs.inputmaskData.envCode = context.environmentRecord.code; //infraProviderName
			req.soajs.inputmaskData.resourceDriver = "atlas";

			if (oneEntry.options && oneEntry.options.previousEnvironment) {
				req.soajs.inputmaskData.previousEnvironment = oneEntry.options.previousEnvironment;
			}
		}

		if (context.template.soajs_project) {
			req.soajs.inputmaskData.soajs_project = context.template.soajs_project;
		}
		//happens when onboard in saas
		else if(soajs_project_imfv){
			req.soajs.inputmaskData.soajs_project = soajs_project_imfv;
		}
		req.soajs.headers = req.headers;
		req.soajs.log.debug("invoking:", oneEntry.command, "with inputs:", req.soajs.inputmaskData);
		infraModule[oneEntry.command](context.config, req, req.soajs, deployer, (error, response) => {
			if (oneEntry.command === 'deployVM' && !error && response && response.id) {
				context.opts.inputs[1].options.params.id = response.id;
			}

			//when using vm and container, reset the container infraProvider as it was
			if (['deployVM', 'getDeployVMStatus', 'onboardVM'].indexOf(oneEntry.command) !== -1 && !error && response && response.id) {
				if (entryOptions && existingProvider && existingProvider._id.toString() !== entryOptions.infraId) {
					context.infraProvider = existingProvider;
				}
			}

			return cb(error, response);
		});
	}
}

const infra = {
	validate: function (req, context, lib, async, BL, modelName, callback) {
		let schema = {
			"type": "object",
			"required": false,
			"properties": {
				"name": { "type": "string", "required": true },
				"type": { "type": "string", "required": true },
				"command": { "type": "string", "required": true },
				"options": { "type": "object", "required": false }
			}
		};

		let myValidator = new req.soajs.validator.Validator();
		async.mapSeries(context.opts.inputs, (oneInfraInput, fCb) => {
			req.soajs.log.debug("Validating One Infra Entry", context.opts.stepPath);
			let status = myValidator.validate(oneInfraInput, schema);
			if (!status.valid) {
				status.errors.forEach(function (err) {
					context.errors.push({ code: 173, msg: `Infra Entry ${context.opts.stepPath}: ` + err.stack });
				});
			}

			return fCb();
		}, callback);
	},

	deploy: function (req, context, lib, async, BL, modelName, callback) {
		//check if previously completed
		if (context.template.deploy[context.opts.stage][context.opts.group][context.opts.stepPath].status) {
			if (context.template.deploy[context.opts.stage][context.opts.group][context.opts.stepPath].status.done) {
				req.soajs.log.debug(`Infra deployment have been previously created`);
				return callback(null, true);
			}
		}

		req.soajs.log.debug(`Checking Deploy Infra ...`);
		let remoteStack = [];
		if (Array.isArray(context.opts.inputs)) {
			remoteStack = context.opts.inputs;
		}
		else {
			remoteStack.push(context.opts.inputs);
		}

		if (remoteStack.length === 0) {
			req.soajs.log.debug("No Infra deployment to create.");
			return callback();
		}

		lib.initBLModel(BL.cloud.infra.module, modelName, (error, infraModule) => {
			lib.checkReturnError(req, callback, { error: error, code: 600 }, () => {
				req.soajs.log.debug("Deploying new Infra ...");
				async.mapSeries(remoteStack, (oneStep, mCb) => {
					if (!oneStep) {
						return mCb();
					}
					invokeAndCheck3rdPartyCall(req, context, infraModule, oneStep, 0, mCb);
				}, (error, finalResponse) => {
					lib.checkReturnError(req, callback, {
						error: error,
						code: (error && error.code) ? error.code : 600
					}, () => {
						req.soajs.log.debug("Infra Deployment completed");
						if (!context.template.deploy[context.opts.stage][context.opts.group][context.opts.stepPath].status) {
							context.template.deploy[context.opts.stage][context.opts.group][context.opts.stepPath].status = {};
						}
						context.template.deploy[context.opts.stage][context.opts.group][context.opts.stepPath].status.done = true;

						let infraInfo = context.template.deploy[context.opts.stage][context.opts.group][context.opts.stepPath].imfv[1];
						let outputResponse = JSON.parse(JSON.stringify(finalResponse));
						
						//once a vm has been created or onboarded, update the inputs of all resources that need to be deployed on this vm layer
						//compute and add the instances ids of the created or onboarded vm so that the wizard can deploy these resource in it
						if (infraInfo && infraInfo.command === 'getDeployVMStatus') {
							//clean up the final Response
							delete outputResponse[1].inputs;
							delete outputResponse[1].vms;

							for (let group in context.template.deploy.deployments) {
								for (let step in context.template.deploy.deployments[group]) {
									if (step.indexOf("deployments.resources") !== -1) {
										let oneStep = context.template.deploy.deployments[group][step];

										if (oneStep.imfv[0].deployOptions && oneStep.imfv[0].deployOptions.deployConfig.vmConfiguration) {
											if (oneStep.imfv[0].deployOptions.deployConfig.infra === finalResponse[0].infraId) {
												if (oneStep.imfv[0].deployOptions.deployConfig.vmConfiguration.vmLayer && oneStep.imfv[0].deployOptions.deployConfig.vmConfiguration.vmLayer === infraInfo.name + '_' + finalResponse[0].name) {
													//do the modification here, add the instances to this entry
													
													//next to vmConfiguration.vmLayer --> group: finalResponse[1].inputs.group
													oneStep.imfv[0].deployOptions.deployConfig.vmConfiguration.group = finalResponse[1].inputs.group;
													oneStep.imfv[0].deploy.options.deployConfig.vmConfiguration.group = finalResponse[1].inputs.group;
													
													if(finalResponse[1].vms){
														let finalVMNames =[];
														let serverCount = 0;
														finalResponse[1].vms.forEach((oneVMInstance) => {
															if(finalVMNames.indexOf(oneVMInstance.name) === -1){
																finalVMNames.push(oneVMInstance.name);
																
																if(oneVMInstance.ip){
																	if(!oneStep.imfv[0].config.servers[serverCount]){
																		oneStep.imfv[0].config.servers[serverCount] = {host: '', port: oneStep.imfv[0].config.servers[0].port};
																	}
																	oneStep.imfv[0].config.servers[serverCount].host = oneVMInstance.ip;
																}
															}
															serverCount++;
														});
														oneStep.imfv[0].deployOptions.vms = finalVMNames;
														oneStep.imfv[0].deploy.options.vms = finalVMNames;
													}
													
													//override with modification
													context.template.deploy.deployments[group][step] = oneStep;
												}
											}
										}
									}
								}
							}
						}
						
						//update the step in the template to done and added the data needed
						//data needed is used for reference or in the case of rollback
						context.template.deploy[context.opts.stage][context.opts.group][context.opts.stepPath].status.data = outputResponse;
						return callback(null, true);
					});
				});
			});
		});
	},

	rollback: function (req, context, lib, async, BL, modelName, callback) {
		//check if previously completed
		if (context.template.deploy[context.opts.stage][context.opts.group][context.opts.stepPath].status) {
			req.soajs.log.debug(`Rolling back Infra deployment`);

			let infraInfo = context.template.deploy[context.opts.stage][context.opts.group][context.opts.stepPath].imfv[0];
			let myCommand = 'removeEnvFromDeployment';

			switch (infraInfo.command) {
				case 'deployVM':
					myCommand = 'destroyVM';
					break;
				case 'onboardVM':
					myCommand = 'releaseVM';
					break;
			}

			let rollbackEntry = {
				"type": "infra",
				"name": infraInfo.name,
				"command": myCommand,
				"options": infraInfo.options
			};

			let remoteStack = [];
			if (Array.isArray(rollbackEntry)) {
				remoteStack = rollbackEntry;
			}
			else {
				remoteStack.push(rollbackEntry);
			}

			if (remoteStack.length === 0) {
				req.soajs.log.debug("No Infra rollback to run.");
				return callback();
			}

			lib.initBLModel(BL.cloud.infra.module, modelName, (error, infraModule) => {
				lib.checkReturnError(req, callback, { error: error, code: 600 }, () => {
					async.mapSeries(remoteStack, (oneStep, mCb) => {
						if (!oneStep) {
							return mCb();
						}
						invokeAndCheck3rdPartyCall(req, context, infraModule, oneStep, 0, mCb);
					}, (error) => {
						lib.checkReturnError(req, callback, { error: error, code: 600 }, () => {
							req.soajs.log.debug("Infra Rollback completed");
							return callback(null, true);
						});
					});
				});
			});
		}
		else {
			return callback(null, true);
		}
	}
};

module.exports = infra;
