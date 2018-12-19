import files from 'files'

const
asyncMap=function(arr,cb)
{
	return arr.reduce(async function(promiseArr,item)
	{
		return [...await promiseArr,await cb(item)]
	},Promise.resolve([]))
},
readFile=async path=>files.readFile(path,'utf8'),
rmExt=txt=>txt.replace(/\.[^\.]+$/,''),
src2dest=src=>src.split('/').filter(x=>x.length).slice(0,-1).join('/')+'/',
categories='index,config,util,logic,input,output'
	.split(',')
	.reduce((obj,key)=>Object.assign(obj,{[key]:[]}),{})

export default async function compiler(src)
{
	if(!src.match(/\/$/)) src+='/'//@todo integrate with file utils

	const
	names=await files.readDir(src),
	paths=names.map(name=>src+name),
	vals=await asyncMap(paths,readFile),
	keys=names.map(rmExt),
	sortedNames=keys
	.sort()
	.reduce(function(rtn,key)
	{
		const [cat]=key.split('.')

		rtn[cat]?rtn[cat].push(key):rtn[cat]=[key]

		return rtn 
	},Object.assign({},JSON.parse(JSON.stringify(categories))))

	return Object.values(sortedNames)
	.reduce((a,b)=>a.concat(b.sort()),[])//flatten
	.map(x=>keys.indexOf(x))
	.map(i=>vals[i])
	.filter(txt=>!!txt&&!!txt.length)
	.join('\n')
}
compiler.writer=async function(src,dest=src2dest(src))
{
	const data=await compiler(src)

	await files.writeFile(dest+'index.js',data)
	.catch(console.error)
}