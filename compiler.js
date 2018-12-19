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

	await files.writeFile(dest+'index.js',data)
	.catch(console.error)
}