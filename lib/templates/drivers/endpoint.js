"use strict";

const driver = {
	
	"check": function (req, context, lib, async, BL, callback) {
		//validate if ci schema is valid
		let template = context.template;
		
		let imfv = context.config.schema.post["/apiBuilder/add"];
		let schema = {
			type: 'object',
			properties: {
				"serviceGroup": imfv.serviceGroup.validation,
				"serviceName": imfv.serviceName.validation,
				"servicePort": imfv.servicePort.validation,
				"serviceVersion": imfv.serviceVersion.validation,
				"requestTimeout": imfv.requestTimeout.validation,
				"requestTimeoutRenewal": imfv.requestTimeoutRenewal.validation,
				"oauth": imfv.oauth.validation,
				"epType": imfv.epType.validation,
				"extKeyRequired": imfv.extKeyRequired.validation,
				"prerequisites": imfv.prerequisites.validation,
				"swaggerInput": imfv.swaggerInput.validation,
				"authentications": imfv.authentications.validation,
				"defaultAuthentication": imfv.defaultAuthentication.validation,
				"schema": imfv.schemas.validation,
				"errors": {
					"type": "object",
					"patternProperties": {
						"^[0-9]+$": {
							"type": "string",
							"required": true
						}
					}
				}
			}
		};
		
		let myValidator = new req.soajs.validator.Validator();
		
		//check if name exists
		if (template.content && template.content.endpoints && template.content.endpoints.data && template.content.endpoints.data.length > 0) {
			let endpoints = template.content.endpoints.data;
			async.eachSeries(endpoints, (oneEndpoint, cb) => {
				
				async.series({
					"validateSchema": (mCb) => {
						let status = myValidator.validate(oneEndpoint, schema);
						if (!status.valid) {
							let errors = [];
							status.errors.forEach(function (err) {
								errors.push({code: 173, msg: err.stack})
							});
							return mCb(errors);
						}
						return mCb(null, true);
					},
					"checkDuplicate": (mCb) => {
						let opts = {
							conditions: {
								$or: [
									{serviceName: oneEndpoint.serviceName},
									{servicePort: oneEndpoint.servicePort}
								]
							},
							collection: "api_builder_endpoints",
						};
						
						BL.model.countEntries(req.soajs, opts, function (error, count) {
							lib.checkReturnError(req, cb, {config: context.config, error: error, code: 600}, () => {
								if (count && count === 1) {
									return mCb({
										"code": 173,
										"msg": `An entry with the same name or port a endpoint ${oneEndpoint.serviceName} already exists => ${oneEndpoint.serviceName}`
									});
								}
								return mCb(null, true);
							});
						});
					},
					"checkServicesConflict": (mCb) => {
						let opts = {
							conditions: {
								$or: [
									{name: oneEndpoint.serviceName},
									{port: oneEndpoint.servicePort}
								]
							},
							collection: "services",
						};
						
						BL.model.countEntries(req.soajs, opts, function (error, count) {
							lib.checkReturnError(req, cb, {config: context.config, error: error, code: 600}, () => {
								if (count && count === 1) {
									return mCb({
										"code": 173,
										"msg": `A service in the API Catalog has the same name or port value as endpoint ${oneEndpoint.serviceName} => ${oneEndpoint.serviceName}`
									});
								}
								return mCb(null, true);
							});
						});
					}
				}, (error) => {
					if (error) {
						context.errors.push(error);
					}
					return cb(null, true);
				});
				
			}, callback);
		} else {
			return callback();
		}
	},
	
	"merge": function (req, context, lib, async, BL, callback) {
		
		if (req.soajs.inputmaskData.correction && req.soajs.inputmaskData.correction.endpoints) {
			req.soajs.inputmaskData.correction.endpoints.forEach((oneEndpointInput) => {
				
				context.template.content.endpoints.data.forEach((oneTemplateEndpoint) => {
					if (oneEndpointInput.old === oneTemplateEndpoint.name) {
						oneTemplateEndpoint.serviceName = oneEndpointInput.new;
						oneTemplateEndpoint.servicePort = oneEndpointInput.port;
					}
				});
			});
		}
		
		return callback();
	},
	
	//save & publish
	"save": function (req, context, lib, async, BL, callback) {
		if (context.content && context.content.endpoints && context.content.endpoints.data && context.content.recipes.endpoints.data > 0) {
			lib.initBLModel('endpoint', (error, endpointModule) => {
				lib.checkReturnError(req, callback, {config: context.config, error: error, code: 600}, () => {
					
					let endpoints = context.content.endpoints.data;
					async.eachSeries(endpoints, (oneEndpoint, cb) => {
						
						async.auto({
							"createEndpoint": (mCb) => {
								req.soajs.inputmaskData = oneEndpoint;
								req.soajs.inputmaskData.mainType = "endpoint";
								req.soajs.inputmaskData.import = true;
								endpointModule.add(context.config, req, (error, endPointId) => {
									lib.checkReturnError(req, mCb, {
										config: context.config,
										error: error,
										code: 600
									}, () => {
										return mCb(null, endPointId);
									});
								});
							},
							"publishEndpoint": ["createEndpoint", (info, mCb) => {
								req.soajs.inputmaskData = {
									"mainType": "endpoint",
									"endpointId": info.createEndpoint
								};
								endpointModule.publish(context.config, req, (error) => {
									lib.checkReturnError(req, mCb, {
										config: context.config,
										error: error,
										code: 600
									}, mCb);
								});
							}]
						}, cb);
					}, callback);
				});
			});
		} else {
			return callback();
		}
	},
	
	//export endpoints and associated resources
	"export": function(req, context, lib, async, BL, callback){
		if (req.soajs.inputmaskData.endpoints && req.soajs.inputmaskData.endpoints.length > 0) {
			context.dbData.endpoints = [];
			
			let associatedResources = [];
			let endpoints = req.soajs.inputmaskData.endpoints;
			async.map(endpoints, (oneEndpointId, cb) => {
				oneEndpointId = new BL.model.getDb(req.soajs).ObjectId(oneEndpointId);
				return cb(null, oneEndpointId);
			}, (error, ids)=> {
				//no error in this case
				
				BL.model.find(req.soajs, {
					"collection": "api_builder_endpoints",
					"conditions": {
						"_id": { "$in": ids }
					}
				}, (error, records) =>{
					lib.checkReturnError(req, callback, {config: context.config, error: error, code: 600}, () => {
						async.map(records, (oneRecord, mCb) => {
							oneRecord.epType = oneRecord.models.name;
							
							delete oneRecord._id;
							delete oneRecord.created;
							delete oneRecord.type;
							delete oneRecord.injection;
							delete oneRecord.models;
							
							//if resource auth is not none, add it to context
							if(oneRecord.defaultAuthentication && oneRecord.defaultAuthentication.toLowerCase() !== 'none'){
								if(associatedResources.indexOf(oneRecord.defaultAuthentication) === -1){
									associatedResources.push(oneRecord.defaultAuthentication);
								}
							}
							
							//if resource apis auth is not none, add it to context
							if(oneRecord.authentications && oneRecord.authentications.length > 0){
								oneRecord.authentications.forEach((oneAuthResource) => {
									if(oneAuthResource.name.toLowerCase() !== 'none' && associatedResources.indexOf(oneAuthResource.name) === -1){
										associatedResources.push(oneAuthResource.name);
									}
								});
							}
							context.dbData.endpoints.push(oneRecord);
							
							return mCb();
						}, () =>{
							//check if there are resources that should be added in the template as well
							if(associatedResources.length > 0){
								context.dbData.resources = {};
								BL.model.find(req.soajs, {
									"collection": "resources",
									"conditions": {
										"type": "authorization",
										"name": { "$in": associatedResources }
									}
								}, (error, records) =>{
									lib.checkReturnError(req, callback, {config: context.config, error: error, code: 600}, () => {
										async.map(records, (oneRecord, mCb) => {
											context.dbData.resources[oneRecord.name] = {
												"label": oneRecord.name,
												"type": oneRecord.type,
												"category": oneRecord.category,
												"ui": "${REF:resources/drivers/authorization/" + oneRecord.category + "}"
											};
											return mCb();
										}, callback);
									});
								});
							}
							else{
								return callback();
							}
						});
					});
				});
			});
		} else {
			return callback();
		}
	}
	
};

module.exports = driver;