const {assign}=Object
export default assign(function silo(...args)
{
	console.warn('This file is being deprecated')
	return args.reduce(function(silo,arg)
	{
		return	!(arg instanceof Function)?assign(silo,arg):
				arg.name?assign(silo,{[arg.name]:assign(arg,silo[arg.name])}):
				assign(arg,silo)
	},silo)
},
{
	config:
	{
		state:{}
	},
	util:{},
	logic:{},
	input:{},
	output:{}
})