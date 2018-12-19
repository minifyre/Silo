import fs from 'fs'

const
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
readFile=async path=>callback2promise(fs.readFile,path,'utf8'),
src2dest=src=>src.split('/').filter(x=>x.length).slice(0,-1).join('/')+'/'

export default async function compiler(src)
{
	const
	filepaths='index,config,util,logic,input,output'
		.split(',')
		.map(name=>src+name+'.js'),
	getFile=path=>readFile(path).catch(()=>''),
	files=await asyncMap(filepaths,getFile)

	return files.join('\n')//@todo can this be combined with previous line?
}
compiler.writer=async function(src,dest=src2dest(src))
{
	const data=await compiler(src)

	await callback2promise(fs.writeFile,dest+'index.js',data)
	.catch(console.error)
}