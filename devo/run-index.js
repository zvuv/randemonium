'use strict';

/**
 *@module run-ranTree
 */

const { RanArray, RanObj, RanTree, RanElement, RanDigits, RanInt } = require( './../index' ),
	  {fillArray, printNode }=require( './../_' )
	  ;

// let len = 100,nSamples=100000;
// let array = Array(len).fill().map((e,i)=>i);
// let wts = Array(len).fill().map(_=>1/len);
// let counts= Array(len).fill(0);
//
// let ranElement = RanElement(array);
//
// for(let j=0; j<nSamples; j++){
// 	let ranE = ranElement();
// 	counts[ranE]=counts[ranE]+1;
// }
//
//
// counts.forEach(c=>console.log(c));
//
//obj

// let ranObj = RanObj({maxDepth:10, maxWidth:10});
// let o=ranObj();
// console.log(printNode(o));

// let ranTree = RanTree({maxDepth:10, maxWidth:10});
// let t=ranTree();
// console.log(printNode(t));
// let x=1;

let ranArray = RanArray({maxDepth:10, maxWidth:5});
let a=ranArray();
console.log(printNode(a));

// let ranDigits=RanDigits(6);
//
// let digits = Array(10).fill().map(ranDigits);
//
// digits.forEach(e=>console.log(e));

// let ranInt = RanInt( { min: 1000, max: 2000 } );
//
// //let ints = Array( 100 ).fill().map( ranInt );
//
// let ints = fillArray(100, ranInt);
//
// let ave = ints.reduce( ( sum, val ) =>{
// 		  sum += val;
// 		  return sum;
// 	  }, 0 )/ints.length;
//
// ints.forEach( e => console.log( e-ave ) );
//
// console.log(`ave:${ave}`);