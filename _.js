'use strict';

/**
 * @module  _
 * Utilities
 */ 

 const isFunction = (function(){
	const toString = Object.prototype.toString,
		  FSTRING = toString.call(()=>_)
		  ;

	return  (f)=> Boolean(f) && toString.call(f) === FSTRING;
})();

function isObject( x ){
	return Boolean(x)
		  && !(x instanceof String)
		  && !(x instanceof Function)
		  && Object( x ) === x
		  ;
}

function arrayMapFill(n,mapFcn){
	return n>0? Array(n).fill().map(mapFcn):[];
}

/**
 * Shallow copy of enumerable, own properties onto the target object
 * Copies full descriptors - that is it includes properties
 * indexed by Symbols and get/set accessors.
 *
 * developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
 *
 * @param target
 * @param sources
 * @return {Object}
 */
function completeAssign(target, ...sources) {

  sources.forEach(src => {
    let descriptors = Object.keys(src).reduce((desc, key) => {
      desc[key] = Object.getOwnPropertyDescriptor(src, key);
      return desc;
    }, {});

    // by default, Object.assign copies enumerable Symbols too
    Object.getOwnPropertySymbols(src).forEach(sym => {
      let descriptor = Object.getOwnPropertyDescriptor(src, sym);
      if (descriptor.enumerable) {
        descriptors[sym] = descriptor;
      }
    });

    Object.defineProperties(target, descriptors);
  });

  return target;
}

/**
 * Extended version of Object.create.  Copies properties of the mixin
 * objects onto the new prototype
 *
 * @param proto
 * @param mixins
 * @return {Object}
 */
function createObject(proto,...mixins){
	const o = Object.create(proto);
	return completeAssign(o,...mixins);
}

function printNode(node, depth=0){
	const indent = ' '.repeat(depth*3);
	let str = Object.keys(node).reduce((pv,key)=>{
		let val = node[key];
		pv+= `\n  ${indent}${key}: ${isObject(val)? printNode(val,depth+1):val.toString()}`;
		return pv;
	},'');

	return  Array.isArray(node)?  str.length>0?`[${str} \n${indent}]`:'[]'
										:  str.length>0?`{${str} \n${indent}}`:'{}'
										;
}

module.exports = {isObject,isFunction, arrayMapFill, completeAssign, createObject, printNode};
