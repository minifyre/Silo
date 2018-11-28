const
fs=require('fs'),
asyncMap=function(arr,cb)
{
	return arr.reduce(async function(promiseArr,item)
	{
		return [...await promiseArr,await cb(item)]
	},Promise.resolve([]))
},
callback2promise=function(func,...args)
{
	return new Promise(function(res,rej)
	{
		func(...args,(err,data)=>err?rej(err):res(data))
	})
},
readFile=async path=>callback2promise(fs.readFile,path,'utf8')

;(async function()
{
	const
	filepaths='index,config,util,logic,input,output'
		.split(',')
		.map(name=>__dirname+'/src/'+name+'.js'),
	files=await asyncMap(filepaths,readFile).catch(console.error)

	await callback2promise(fs.writeFile,__dirname+'/index.js',files.join('\n'))
	.catch(console.error)
})()