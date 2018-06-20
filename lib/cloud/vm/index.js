'use strict';
const fs = require("fs");
const utils = require("../../../utils/utils.js");
const async = require("async");
const infraColname = 'infra';

function checkIfError(soajs, mainCb, data, cb) {
	utils.checkErrorReturn(soajs, mainCb, data, cb);
}

var BL = {
	model: null,
	
	/**
	 * List all deployed virtual machines by account
	 *
	 * @param  {Object}   config
	 * @param  {Object}   soajs
	 * @param  {Object}   deployer
	 * @param  {Function} cbMain
	 */
	"listVMs": function (config, soajs, deployer, cbMain) {
		
		let result = {};
		async.auto({
			"getEnvironment": (mCb) =>{
				utils.getEnvironment(soajs, BL.model, soajs.inputmaskData.env.toUpperCase(), (error, envRecord) => {
					checkIfError(soajs, mCb, { config: config, error: error || !envRecord, code: 600 }, mCb);
				});
			},
			"getInfras": (mCb) => {
				let opts = {
					collection: infraColname,
					conditions: {
						"technologies": {$in: ["vm"]}
					}
				};
				BL.model.findEntries(soajs, opts, function (err, infraRecords) {
					checkIfError(soajs, mCb, {config: config, error: err, code: 600}, () => {
						checkIfError(soajs, mCb, {config: config, error: !infraRecords, code: 600}, () => {
							return mCb(null, infraRecords);
						});
					});
				});
			},
			"callDeployer": ["getEnvironment", "getInfras", (info, mCb) => {
				let options = { soajs: soajs, env: soajs.inputmaskData.env.toLowerCase() };
				async.eachSeries(info.getInfras, (oneInfra, vCb) => {
					options.infra = oneInfra;
					deployer.execute({ type: "infra", name: oneInfra.name, technology: "vm" }, 'listServices', options, (error, vms) => {
						checkIfError(soajs, vCb, {config: config, error: error}, () => {
							if (!result[oneInfra.name]) {
								result[oneInfra.name] = {
									list: [],
									label: oneInfra.label
								};
							}
							result[oneInfra.name].list = result[oneInfra.name].list.concat(vms);
							return vCb(null, true);
						});
					});
				}, mCb);
			}]
		}, (error) => {
			checkIfError(soajs, cbMain, {config: config, error: error}, () => {
				return cbMain(null, result);
			});
		});
	},
	
	/**
	 * Execute a command inside a running virtual machine
	 *
	 * This functions takes its arguments either from
	 *  - soajs.inputmaskData.recipe (catalog recipe)
	 *  - soajs.inputmaskData.opts
	 *      --command
	 *      --args
	 *      --env environment variables object
	 * A command property must be provided!
	 * This function will not wait for the execution of the command
	 * @param  {Object}   config
	 * @param  {Object}   soajs
	 * @param  {Object}   deployer
	 * @param  {Function} cbMain
	 */
	"runCommand": function (config, soajs, deployer, cbMain) {
		let options = {
			infra: soajs.inputmaskData.infraRecord,
			soajs: soajs,
			resourceGroupName: soajs.inputmaskData.env.toLowerCase(),
			vmName: soajs.inputmaskData.vmName,
		};
		if (soajs.inputmaskData.recipe && soajs.inputmaskData.recipe.recipe && soajs.inputmaskData.recipe.recipe.buildOptions){
			if (soajs.inputmaskData.recipe.recipe.buildOptions.env){
				options.env = soajs.inputmaskData.recipe.recipe.buildOptions.env;
			}
			
			if (soajs.inputmaskData.recipe.recipe.buildOptions.cmd && soajs.inputmaskData.recipe.recipe.buildOptions.cmd.deploy ){
				if (soajs.inputmaskData.recipe.recipe.buildOptions.cmd.deploy.command){
					options.command = soajs.inputmaskData.recipe.recipe.buildOptions.cmd.deploy.command;
				}
				if (soajs.inputmaskData.recipe.recipe.buildOptions.cmd.deploy.args){
					options.args = soajs.inputmaskData.recipe.recipe.buildOptions.cmd.deploy.args;
				}
			}
		}
		else {
			if (soajs.inputmaskData.opts){
				if (soajs.inputmaskData.opts.command){
					options.command = soajs.inputmaskData.command;
				}
				if (soajs.inputmaskData.opts.env){
					options.env = soajs.inputmaskData.env;
				}
				if (soajs.inputmaskData.opts.args){
					options.args = soajs.inputmaskData.args;
				}
			}
		}
		checkIfError(soajs, cbMain, {config: config, error: {error: !options.command, message: 'No command was provided!'}}, () => {
			deployer.execute({ type: "infra", name: soajs.inputmaskData.infraRecord.name, technology: 'vm' }, 'runCommand', options, (error, res) => {
				if (error){
					soajs.log.error(error);
				}
				else {
					soajs.log.info(res);
				}
			});
			return cbMain(null, true);
		});
	},
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