"use strict";

var errors = {
	"400": "Unable to add the environment record",
	"401": "Unable to update the environment record",
	"402": "Unable to get the environment records",
	"403": "Environment already exists",
	"404": "Unable to remove environment record",
	"405": "Invalid environment id provided",
	"406": "Unable to update tenant key security information",

	"409": "Invalid product id provided",
	"410": "Unable to add the product record",
	"411": "Unable to update the product record",
	"412": "Unable to get the product record",
	"413": "Product already exists",
	"414": "Unable to remove product record",
	"415": "Unable to add the product package",
	"416": "Unable to update the product package",
	"417": "Unable to get the product packages",
	"418": "Product package already exists",
	"419": "Unable to remove product package",

	"420": "Unable to add the tenant record",
	"421": "Unable to update the tenant record",
	"422": "Unable to get the tenant records",
	"423": "Tenant already exists",
	"424": "Unable to remove tenant record",

	"425": "Unable to add the tenant OAuth",
	"426": "Unable to update the tenant OAuth",
	"427": "Unable to get the tenant OAuth",
	"428": "Unable to remove tenant OAuth",

	"429": "Unable to add the tenant application",
	"430": "Unable to update the tenant application",
	"431": "Unable to get the tenant application",
	"432": "Unable to remove tenant application",
	"433": "Tenant application already exist",
	"434": "Invalid product code or package code provided",

	"435": "Unable to get the tenant application keys",
	"436": "Unable to add a new key to the tenant application",
	"437": "Unable to remove key from the tenant application",
	"438": "Invalid tenant Id provided",
	"439": "Invalid tenant oauth user Id provided",

	"440": "Unable to add the tenant application ext Key",
	"441": "Unable to update the tenant application ext Key",
	"442": "Unable to get the tenant application ext Keys",
	"443": "Unable to remove tenant application ext Key",
	"444": "Unable to get the tenant application configuration",
	"445": "Unable to update the tenant application configuration",
	"446": "Invalid environment provided",

	"447": "Unable to get tenant oAuth Users",
	"448": "tenant oAuth User already exists",
	"449": "Unable to add tenant oAuth User",
	"450": "Unable to remove tenant oAuth User",
	"451": "Unable to updated tenant oAuth User",

	"460": "Unable to find product",
	"461": "Unable to find package",

	"500": "This record is locked. You cannot delete it",
	"501": "This record is locked. You cannot modify or delete it",
	"502": "Invalid cluster name provided",
	"503": "Error adding new environment database",
	"504": "Environment cluster already exists",
	"505": "Error adding environment cluster",
	"506": "Error updating environment cluster",
	"507": "Invalid db Information provided for session database",
	"508": "cluster not found",
	"509": "environment database already exist",
	"510": "environment session database already exist",
	"511": "environment session database does not exist",
	"512": "environment database does not exist",
	"513": "Error updating environment database",
	"514": "Error removing environment database",

	"600": "Database error",
	"601": "No Logged in User found.",
	"602": "Invalid maintenance operation requested.",
	"603": "Error executing maintenance operation.",
	"604": "Service not found.",
	"605": "Service Host not found.",
	"606": "Error adding an administrator user for tenant",
	"607": "Error adding an administrator group for tenant",
	"608": "Permissions denied to access this section",
	"609": "Dashboard service is not accessible at the time being Come back later.",

	"700": "This Content Schema already Exist",
	"701": "Invalid Id provided",
	"702": "Content Schema doesn't exists"
};


module.exports = errors;