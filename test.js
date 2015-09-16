
// if( !Array.prototype.find ) {
//   Array.prototype.find = function (iteratee) {
//     if( !( iteratee instanceof Function ) ) {
//       var value = iteratee;
//       iteratee = function (item) {
//         return item === value;
//       };
//     }
//
//     for( var i = 0, n = this.length ; i < n ; i++ ) {
//       if( iteratee(this[i]) ) {
//         return this[i];
//       }
//     }
//   };
// }
//
// var list = [1,2,3,4,5,6,7,8,9];
//
// console.log( list.find(function (n) { return n > 5; }) );

// console.log('test', require('./lib/nitro').package('npm').dependencies().getList() );


require('./lib/nitro').package('npm').dependencies().each(function (dependence, version) {
  console.log(dependence, version);
});
