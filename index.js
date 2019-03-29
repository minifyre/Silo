const
config=
{
	state:
	{
		file:
		{
			cache:{},
			data:{},
			meta:{}
		},
		view:
		{
			type:'custome-element'
		},
	},
	newline:/\r\n?|\n/
},
util=
{
	id:()=>([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,util.idHelper),
	idHelper:c=>(c^util.idRand()[0]&15>>c/4).toString(16),
	idRand:()=>crypto.getRandomValues(new Uint8Array(1)),

	evt2customEl:({path})=>path.find(x=>(x.tagName||'').match('-')),

	mk:(...opts)=>Object.assign({id:util.id()},...opts),

	importFiles:paths=>Promise.all(paths.map(x=>fetch(x).then(x=>x.text()))),
},
logic=opts=>logic.normalize(util.mkState(opts)),
output=x=>output.render(x),
input=function(state,evt)
{
	const
	{target,type}=evt,
	attr=`data-${type}`,
	el=util.findParent(target,`[${attr}]`)

	if(!el) return

	const fn=input[el.getAttribute(attr)]

	return fn(state,new Proxy(evt,{get:(_,prop)=>prop==='target'?el:evt[prop]}))
}
util.asyncMap=function(arr,cb)
{
	return arr.reduce(async function(promiseArr,item,i,arr)
	{
		return [...await promiseArr,await cb(item,i,arr)]
	},Promise.resolve([]))
}
util.assignNested=function(obj,...srcs)
{
	const isObj=x=>x&&typeof x==='object'&&!Array.isArray(x)

	srcs.forEach(function(src)
	{
		if(![obj,src].every(isObj)) return

		Object.entries(src).forEach(function([key,val])
		{
			!isObj(val)||!obj[key]?obj[key]=val:
			util.assignNested(obj[key],val)
		})
	})

	return obj
}
util.box2style=function({height,x:left,y:top,width})
{
	return Object.entries({height,left,top,width})
	.map(([prop,val])=>prop+':'+val+'%;')
	.join(' ')
}
util.clone=x=>JSON.parse(JSON.stringify(x))
util.curry=(fn,...xs)=>(...ys)=>fn(...xs,...ys)
util.curryN=(int,fn,...xs)=>(...ys)=>fn(...xs,...ys.slice(0,int))
util.flatten=(a,b)=>a.concat(b)
util.mkFile=(...opts)=>util.mk({cache:{},data:{},meta:{encoding:'utf-8',modified:Date.now(),mime:'',path:''}},...opts)
util.mkFileCode=(type='html',...opts)=>util.mkFile({category:'code',errors:[],type,value:''},...opts)
util.mkFileFont=(type='otf',...opts)=>util.mkFile({category:'font',type},...opts)
util.mkFileImg=function(type='png',...opts)
{
	return util.mkFile(
	{
		category:'rastor',
		encoding:'binary',
		height:100,
		palette:[],
		pts:[],
		type,
		width:100
	},...opts)
}
//@todo el could match select, rename to make this more clear
util.findParent=function(el,sel)
{
	while(el&&!el.matches(sel)) el=el.parentElement
	return el
}
util.mkCustomEl=async function(url='',customEl,customMkr)
{
	if(!url.length) return
	const
	[css]=await util.importFiles([url+'index.css'])
	config.css=css
	customElements.define(customEl,customMkr)
}
util.mkState=function(opts)
{
	const state=util.assignNested({},config.state,opts)
	state.file.id=util.id()
	state.view.id=util.id()
	state.view.file=state.file.id
	return state
}

logic.normalize=x=>x
output.render=state=>[]

const props={config,util,logic,input,output}

if(typeof HTMLElement!=='undefined')
{
	props.customElement=class extends HTMLElement
	{
		constructor(state,{logic,output}={})
		{
			super()
			const shadow=this.attachShadow({mode:'open'})
			if(!logic) return
			let renderer=x=>x
			this.state=truth(logic(state),(...args)=>renderer(args)).state
			this.render=renderer=v.render(shadow,this,output)
		}
		load(state)
		{
			Object.assign(this.state,silo.logic(state))
		}
	}
}

export default Object.assign(function silo(fn)
{
	return Object.assign(fn,silo)

},props)