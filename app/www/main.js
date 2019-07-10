
var sporikApp = angular.module('sporikApp', ['chart.js','angularModalService', 'objValueFilter', 'ngCookies', 'dndLists']);

angular.module('objValueFilter',[])
.filter('objVal', function() {
  return function(input, search) {
    if (!input) return input;
    if (!search) return input;
    var result = {};
    angular.forEach(input, function(value, key) {
    	angular.forEach(search, function (searchValue, searchKey) {
      		if (value.hasOwnProperty(searchKey) && value[searchKey] === searchValue) {
       			//result[key] = value;
       			result[key] = value; //.push(value);
      		}
      	});
    });
    return result;
  }
});


/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
