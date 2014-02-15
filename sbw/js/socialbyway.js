/**
 * @class
 * @name SBW
 * @classdesc Namespace for Model,Controller and Views
 * @module SocialByWay
 * @namespace SBW
 */

var SBW = SBW || {};
/**
 * @class
 * @classdesc Namespace for Model
 * @module SocialByWay
 * @namespace SBW.Models
 */
SBW.Models = SBW.Models || {};
/**
 * @class
 * @classdesc Namespace for Controller
 * @module SocialByWay
 * @namespace SBW.Controllers
 */
SBW.Controllers = SBW.Controllers || {};
/**
 * @class
 * @classdesc Namespace for Views
 * @module SocialByWay
 * @namespace SBW.Views
 */
SBW.Views = SBW.Views || {};
/**
 * @class
 * @classdesc Namespace for Services
 * @module SocialByWay
 * @namespace SBW.Controllers.Services
 */
SBW.Controllers.Services = SBW.Controllers.Services || {};
/**
 * @class
 * @classdesc Namespace for Singleton classes
 * @module SocialByWay
 * @namespace SBW.Singletons
 * @ignore
 */

SBW.Singletons = SBW.Singletons || {};

/**
 * @ignore
 * @param namespaceString
 */


SBW.registerNamespace = function (namespaceString) {
  var parts = namespaceString.split('.'),
    parent = SBW,
    currentPart = '';

  for (var i = 0, length = parts.length; i < length; i++) {
    currentPart = parts[i];
    parent[currentPart] = parent[currentPart] || {};
    parent = parent[currentPart];
  }

  return parent;
};
/**
 * @class
 * @namespace SBW.Object
 * @constructor
 * @ignore
 */
SBW.Object = function () {};
/**
 * @class
 * @param _instance
 * @param _static
 * @return {Function}
 * @ignore
 */
SBW.Object.extend = function (_instance, _static) {
  var extend = SBW.Object.prototype.extend;

  // build the prototype
  SBW.Object._prototyping = true;
  var proto = new this;
  extend.call(proto, _instance);
  proto.base = function () {
    // call this method from any other method to invoke that method's ancestor
  };
  delete SBW.Object._prototyping;

  // create the wrapper for the constructor function
  //var constructor = proto.constructor.valueOf(); //-dean
  var constructor = proto.constructor;
  var nClass = proto.constructor = function () {
    if (!SBW.Object._prototyping) {
      if (this._constructing || this.constructor == nClass) { // instantiation
        this._constructing = true;
        constructor.apply(this, arguments);
        delete this._constructing;
      } else if (arguments[0] != null) { // casting
        return (arguments[0].extend || extend).call(arguments[0], proto);
      }
    }
  };

  // build the class interface
  nClass.ancestor = this;
  nClass.extend = this.extend;
  nClass.forEach = this.forEach;
  nClass.implement = this.implement;
  nClass.set = this.set;
  nClass.get = this.get;
  nClass.prototype = proto;
  nClass.toString = this.toString;
  nClass.valueOf = function (type) {
    //return (type == "object") ? klass : constructor; //-dean
    return (type == "object") ? nClass : constructor.valueOf();
  };
  extend.call(nClass, _static);
  // class initialisation
  if (typeof nClass.init == "function") nClass.init();
  return nClass;
};
/**
 * @class
 * @augments SBW.Object
 * @type {Object}
 * @ignore
 */
SBW.Object.prototype = {
  extend:function (source, value) {
    if (arguments.length > 1) { // extending with a name/value pair
      var ancestor = this[source];
      if (ancestor && (typeof value == "function") && // overriding a method?
        // the valueOf() comparison is to avoid circular references
        (!ancestor.valueOf || ancestor.valueOf() != value.valueOf()) &&
        /SBW.\bbase\b/.test(value)) {
        // get the underlying method
        var method = value.valueOf();
        // override
        value = function () {
          var previous = this.parent || SBW.Object.prototype.base;
          this.parent = ancestor;
          var returnValue = method.apply(this, arguments);
          this.parent = previous;
          return returnValue;
        };
        // point to the underlying method
        value.valueOf = function (type) {
          return (type == "object") ? value : method;
        };
        value.toString = SBW.Object.toString;
      }
      this[source] = value;
    } else if (source) { // extending with an object literal
      var extend = SBW.Object.prototype.extend;
      // if this object has a customised extend method then use it
      if (!SBW.Object._prototyping && typeof this != "function") {
        extend = this.extend || extend;
      }
      var proto = {toSource:null};
      // do the "toString" and other methods manually
      var hidden = ["constructor", "toString", "valueOf"];
      // if we are prototyping then include the constructor
      var i = SBW.Object._prototyping ? 0 : 1;
      while (key = hidden[i++]) {
        if (source[key] != proto[key]) {
          extend.call(this, key, source[key]);

        }
      }
      // copy each of the source object's properties to this object
      for (var key in source) {
        if (!proto[key]) extend.call(this, key, source[key]);
      }
    }
    return this;
  },
  set:function (key, value) {
    this[key] = value;
  },
  get:function (key) {
    return this[key];
  }
};

/**
 * @desc Initializing the SBW Object
 * @type {*}
 * @ignore
 */
SBW.Object = SBW.Object.extend({
  constructor:function () {
    this.extend(arguments[0]);
  }
}, {
  ancestor:Object,
  version:"1.1",

  forEach:function (object, block, context) {
    for (var key in object) {
      if (this.prototype[key] === undefined) {
        block.call(context, object[key], key, object);
      }
    }
  },

  implement:function () {
    for (var i = 0; i < arguments.length; i++) {
      if (typeof arguments[i] == "function") {
        // if it's a function, call it
        arguments[i](this.prototype);
      } else {
        // add the interface using the extend method
        this.prototype.extend(arguments[i]);
      }
    }
    return this;
  },

  toString:function () {
    return String(this.valueOf());
  }
});
/*
 Class : Logger
 This utility class has methods to set the logs levels and show messages in the console.

 Constants:
 DISPLAY - level 1 display type logging object
 ERROR - level 2 error type logging object
 SUCCESS - level 3 success type logging object
 INFO - level 4 info type logging object
 DEBUG - level 5 debug type logging object

 Attributes:
 level - current level of the logger. Set this value to log the messages in console.
 */


SBW.Logger = SBW.Object.extend({
    DISPLAY:{name:'Display', level:1},
    ERROR:{name:'Error', level: 2},
    SUCCESS:{name: 'Success', level:3},
    INFO:{name: 'Info', level: 4},
    DEBUG:{name: 'Debug', level:5},
    on:false,

    /*
     Function: log
     Call this function to set the log message

     Parameters:
     level - level object of type DISPLAY, ERROR, SUCCESS, INFO, DEBUG
     msg - message string
     */

    log:function(level, msg){
    var logger = this;
      if(!window.jasmine) { // don't log when running unit tests
        if (console.log && logger.on) {
            console.log('[' + level.name + '] ' + msg);
        }
      }
    },

    debug: function(msg) {
      this.log(this.DEBUG, msg);
    },

    info: function(msg) {
      this.log(this.INFO, msg);
    },

    error: function(msg) {
      this.log(this.ERROR, msg);
    },

    /*
    Function: logDisplay
    Message to be displayed to the user in the UI

    Parameters:
    msg - message string
    */
    logDisplay: function(msg) {
        this.log(this.DISPLAY, msg);
    }
});
(function () {
  "use strict";
  /*jslint nomen: true*/
  /*jslint plusplus: true */
  /*global SBW,ActiveXObject, $*/
  /**
   * @class Utils
   * @classdesc A service utility class.
   * @constructor
   */
  SBW.Utils = SBW.Object.extend(/** @lends SBW.Utils# */ {
    /**
     * @desc XML Http Request object.
     * @type {XMLHTTPRequest}
     */
    xmlHttpObj: null,
    // Ends the "getSelectedCheckBoxValue" function
    /**
     * @method
     * @desc Returns an array of selected item values in the checkbox group.
     * @param {Element} node The parent dom element to access the checkbox group.
     * @returns {String[]} retArr Array of selected item values.
     */
    getSelectedCheckboxValue: function (node) {
      /**
       * return an array of values selected in the check box group. if no boxes
       * were checked, returned array will be empty (length will be zero)
       * set up empty array for the return values
       */
      var retArr = [],
        i, chkElements = this.getCheckBoxElements(node);
      if (chkElements.length > 0) { // if there was something selected
        for (i = 0; i < chkElements.length; i = i + 1) {
          if (chkElements[i].checked) {
            retArr[i] = chkElements[i].value;
          }
        }
      }
      return retArr;
    },
    /**
     * @method
     * @desc Returns an array of checkbox type dom elements from the specified node.
     * @param {Element} node The parent dom element to filter the checkbox elements.
     * @returns {Element[]} retArr Array of Checkbox dom elements.
     */
    getCheckBoxElements: function (node) {
      var arr = [],
        i, inputArr;
      if (node) {
        inputArr = node.getElementsByTagName('input');
        for (i = 0; i < inputArr.length; i = i + 1) {
          if (inputArr[i].type === "checkbox") {
            arr[arr.length] = inputArr[i];
          }
        }
      }
      return arr;
    },
    /**
     * @method
     * @desc Creates the cross browser compatible xml http request object.
     * @returns {Object} xmlHttpObj Returns the cross browser comaptible XMLHttpRequest object
     */
    createXmlHttpObj: function () {
      var factoryItem, xmlHttpFactories = [

        function () {
          return new XMLHttpRequest();
        }, function () {
          return new ActiveXObject("Msxml2.XMLHTTP");
        }, function () {
          return new ActiveXObject("Msxml3.XMLHTTP");
        }, function () {
          return new ActiveXObject("Microsoft.XMLHTTP");
        }],
        itemSize = xmlHttpFactories.length;

      for (factoryItem = 0; factoryItem < itemSize; factoryItem++) {
        try {
          this.xmlHttpObj = xmlHttpFactories[factoryItem]();
        } catch (error) {
          this.xmlHttpObj = null;
        }
      }
      return this.xmlHttpObj;
    },
    /**
     * @method
     * @desc Creates a cross browser AJAX request.
     * @param {Object} options AJAX Request options.
     * @param {Function} successCallBack Callback to be executed on success. The ajax response will be passed as argument to the callback.
     * @param {Function} failureCallBack Callback to be executed on failure. The ajax response will be passed as argument to the callback.
     */
    ajax: function (options, successCallback, failureCallback) {
      //-- Start Fix for jQuery CORS issue in IE ("No Transport" error)
      $.support.cors = true;
      //-- End Fix for jQuery CORS issue in IE
      $.ajax({
        url: options.url,
        data: options.data,
        cache: options.cache,
        contentType: options.contentType,
        processData: options.processData,
        crossDomain: options.crossDomain || true,
        type: options.type || 'GET',
        dataType: options.dataType,
        beforeSend: function (jqXHR, settings) {
          if (options.customHeaders) {
            $.each(options.customHeaders, function (key, value) {
              jqXHR.setRequestHeader(key, value);
            });
          }
        },
        success: function (data) {
          successCallback(data);
        },
        error: function (data) {
          failureCallback(data);
        }
      });
    },
    /**
     * @method
     * @desc Returns the Query String as a JSON object .
     * @param {String} jsonString The query string to convert to JSON.
     * @returns {Object} vars JSON object.
     */
    getJSONFromQueryParams: function (jsonString) {
      var vars = [],
        hash, hashes = jsonString.contents || jsonString,
        i;
      hashes = hashes.split('&');
      for (i = 0; i < hashes.length; i = i + 1) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[$.trim(hash[0])] = $.trim(hash[1]);
      }
      return vars;
    },
    /**
     * @method
     * @desc Returns the callback URL for the specified service .
     * @param {String} service  Name of the registered service.
     * @returns {String} url Callback URL of the service.
     */
    callbackURLForService: function (service) {
      var _wwwLocation = this._wwwLocation();
      return _wwwLocation.protocol + "//" + _wwwLocation.host + SBW.Singletons.config.callbackDirectory + "/callback" + service + ".html";
    },
    /**
     * @private
     * @desc Returns the parsed location object.
     * @returns {Object} object Parsed location object.
     */
    _wwwLocation: function () {
      var host = "www" + location.host.substr(location.host.indexOf("."));
      return {
        protocol: location.protocol,
        host: host
      };
    },
    /**
     * @method
     * @desc Checks the given object with the required type
     * @param {Object} object Object to check the type
     * @param {Object} requiredType Name of the built-in object
     * @returns {Boolean} boolean Returns the type check status
     */
    isType: function (object, requiredType) {
      var type = object ? object.constructor : undefined;
      //Object.prototype.toString.call(object).match(/^\[object ([a-zA-Z]*)\]$/)[1];
      return type === requiredType;
    },
    /**
     * @method
     * @desc Iterates each array element with the specified callback
     * @param {Object[]} array The array of any type to iterate
     * @param {Function} callback The callback to execute on each array item. The (arrayElement, iterationIndex, actualArray) will be passed as arguments to the callback.
     */
    forEach: function (array, callback) {
      var len = array.length,
        itemIdx;
      if (this.isType(array, Array) && this.isType(callback, Function)) {
        for (itemIdx = 0; itemIdx < len; itemIdx++) {
          if (itemIdx in array) {
            callback.call(array, array[itemIdx], itemIdx, array);
          }
        }
      }
    },
    /**
     * @method
     * @desc Retrieves meta data for the given url.
     * @param {String} url Url to retrieve meta data
     * @param {Function} successcallback Callback function to be executed after successful retrieval of meta.
     * @param {Function} errorcallback Callback function to be executed in case of error while retrieving meta.
     */
    getMetaForUrl: function (url, successcallback, errorcallback) {
      var utils = this;
      utils.ajax({
        url: SBW.Singletons.config.proxyURL + '?url=' + encodeURIComponent(url),
        contentType: 'text',
        type: 'GET'
      }, function (response) {
        var domObject = $.parseHTML(response) || [],
          metaObject = {};
        domObject.forEach(function (value, index, domObject) {
          metaObject.url = url;
          if (value.nodeName.toLowerCase() === 'meta') {
            var attributeMap = value.attributes,
              attribute;
            for (attribute = 0; attribute < attributeMap.length; attribute++) {
              if (attributeMap[attribute].value.toLowerCase() === 'og:description') {
                metaObject.description = value.content;
              } else if (attributeMap[attribute].value.toLowerCase() === 'og:image') {
                metaObject.previewUrl = value.content;
              } else if (attributeMap[attribute].value.toLowerCase() === 'og:url') {
                metaObject.url = value.content;
              } else if (attributeMap[attribute].value.toLowerCase() === 'description') {
                metaObject.description = value.content;
              }
            }
          }
          if (value.nodeName.toLowerCase() === 'title') {
            metaObject.title = value.textContent;
          }
        });
        successcallback(metaObject);
      }, errorcallback);
    },
    /**
     * @method
     * @desc Retrieves meta data for the given url.
     * @param {String} imageURL Url to generate binary data
     * @param {Function} callback Callback function to be executed after successful retrieval of binary data of the image.
     */
    getRawImage: function (imageURL, callback) {
      $('body').append("<image id='duplicate-image' style='display:none' src='" + imageURL + "'/>");
      $('#duplicate-image').load(function () {
        var oImage = document.getElementById('duplicate-image'),
          canvas = document.createElement("canvas");
        document.body.appendChild(canvas);
        if (typeof canvas.getContext === "undefined" || !canvas.getContext) {
          callback(new SBW.Models.User({
            message: "browser does not support this action, sorry"
          }));
        }
        var rawImageData = "";
        try {
          var context = canvas.getContext("2d"),
            width = oImage.width,
            height = oImage.height;
          canvas.style.display = "none";
          canvas.width = width;
          canvas.height = height;
          canvas.style.width = width + "px";
          canvas.style.height = height + "px";
          context.drawImage(oImage, 0, 0, width, height);
          rawImageData = canvas.toDataURL("image/jpeg").split(',')[1];

          var binaryImg = atob(rawImageData);
          document.body.removeChild(canvas);
          $('#duplicate-image').remove();
          callback(binaryImg);
        } catch (err) {
          document.body.removeChild(canvas);
          $('#duplicate-image').remove();
          callback(err);
        }
      });
    }

  });
}());
// End of IIFE
;
/*
 * check out from http://flickr-service.googlecode.com/svn/trunk/
 * home page http://code.google.com/p/flickr-service/
 */


(function() {
    md5={};
    md5.util = {
        utf8_encode: function(str_data) {
            str_data = str_data.replace(/\r\n/g,"\n");
            var tmp_arr = [], ac = 0;

            for (var n = 0; n < str_data.length; n++) {
                var c = str_data.charCodeAt(n);
                if (c < 128) {
                    tmp_arr[ac++] = String.fromCharCode(c);
                } else if((c > 127) && (c < 2048)) {
                    tmp_arr[ac++] = String.fromCharCode((c >> 6) | 192);
                    tmp_arr[ac++] = String.fromCharCode((c & 63) | 128);
                } else {
                    tmp_arr[ac++] = String.fromCharCode((c >> 12) | 224);
                    tmp_arr[ac++] = String.fromCharCode(((c >> 6) & 63) | 128);
                    tmp_arr[ac++] = String.fromCharCode((c & 63) | 128);
                }
            }

            return tmp_arr.join('');
        },

        md5: function(str) {
            var RotateLeft = function(lValue, iShiftBits) {
                    return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));
                };

            var AddUnsigned = function(lX,lY) {
                    var lX4,lY4,lX8,lY8,lResult;
                    lX8 = (lX & 0x80000000);
                    lY8 = (lY & 0x80000000);
                    lX4 = (lX & 0x40000000);
                    lY4 = (lY & 0x40000000);
                    lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);
                    if (lX4 & lY4) {
                        return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
                    }
                    if (lX4 | lY4) {
                        if (lResult & 0x40000000) {
                            return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
                        } else {
                            return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
                        }
                    } else {
                        return (lResult ^ lX8 ^ lY8);
                    }
                };

            var F = function(x,y,z) { return (x & y) | ((~x) & z); };
            var G = function(x,y,z) { return (x & z) | (y & (~z)); };
            var H = function(x,y,z) { return (x ^ y ^ z); };
            var I = function(x,y,z) { return (y ^ (x | (~z))); };

            var FF = function(a,b,c,d,x,s,ac) {
                    a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
                    return AddUnsigned(RotateLeft(a, s), b);
                };

            var GG = function(a,b,c,d,x,s,ac) {
                    a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
                    return AddUnsigned(RotateLeft(a, s), b);
                };

            var HH = function(a,b,c,d,x,s,ac) {
                    a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
                    return AddUnsigned(RotateLeft(a, s), b);
                };

            var II = function(a,b,c,d,x,s,ac) {
                    a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
                    return AddUnsigned(RotateLeft(a, s), b);
                };

            var ConvertToWordArray = function(str) {
                    var lWordCount;
                    var lMessageLength = str.length;
                    var lNumberOfWords_temp1=lMessageLength + 8;
                    var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;
                    var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
                    var lWordArray=Array(lNumberOfWords-1);
                    var lBytePosition = 0;
                    var lByteCount = 0;
                    while ( lByteCount < lMessageLength ) {
                        lWordCount = (lByteCount-(lByteCount % 4))/4;
                        lBytePosition = (lByteCount % 4)*8;
                        lWordArray[lWordCount] = (lWordArray[lWordCount] | (str.charCodeAt(lByteCount)<<lBytePosition));
                        lByteCount++;
                    }
                    lWordCount = (lByteCount-(lByteCount % 4))/4;
                    lBytePosition = (lByteCount % 4)*8;
                    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
                    lWordArray[lNumberOfWords-2] = lMessageLength<<3;
                    lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
                    return lWordArray;
                };

            var WordToHex = function(lValue) {
                    var WordToHexValue="",WordToHexValue_temp="",lByte,lCount;
                    for (lCount = 0;lCount<=3;lCount++) {
                        lByte = (lValue>>>(lCount*8)) & 255;
                        WordToHexValue_temp = "0" + lByte.toString(16);
                        WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2);
                    }
                    return WordToHexValue;
                };

            var x=Array();
            var k,AA,BB,CC,DD,a,b,c,d;
            var S11=7, S12=12, S13=17, S14=22;
            var S21=5, S22=9 , S23=14, S24=20;
            var S31=4, S32=11, S33=16, S34=23;
            var S41=6, S42=10, S43=15, S44=21;

            str = md5.util.utf8_encode(str);
            x = ConvertToWordArray(str);
            a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;

            for (k=0;k<x.length;k+=16) {
                AA=a; BB=b; CC=c; DD=d;
                a=FF(a,b,c,d,x[k+0], S11,0xD76AA478);
                d=FF(d,a,b,c,x[k+1], S12,0xE8C7B756);
                c=FF(c,d,a,b,x[k+2], S13,0x242070DB);
                b=FF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);
                a=FF(a,b,c,d,x[k+4], S11,0xF57C0FAF);
                d=FF(d,a,b,c,x[k+5], S12,0x4787C62A);
                c=FF(c,d,a,b,x[k+6], S13,0xA8304613);
                b=FF(b,c,d,a,x[k+7], S14,0xFD469501);
                a=FF(a,b,c,d,x[k+8], S11,0x698098D8);
                d=FF(d,a,b,c,x[k+9], S12,0x8B44F7AF);
                c=FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);
                b=FF(b,c,d,a,x[k+11],S14,0x895CD7BE);
                a=FF(a,b,c,d,x[k+12],S11,0x6B901122);
                d=FF(d,a,b,c,x[k+13],S12,0xFD987193);
                c=FF(c,d,a,b,x[k+14],S13,0xA679438E);
                b=FF(b,c,d,a,x[k+15],S14,0x49B40821);
                a=GG(a,b,c,d,x[k+1], S21,0xF61E2562);
                d=GG(d,a,b,c,x[k+6], S22,0xC040B340);
                c=GG(c,d,a,b,x[k+11],S23,0x265E5A51);
                b=GG(b,c,d,a,x[k+0], S24,0xE9B6C7AA);
                a=GG(a,b,c,d,x[k+5], S21,0xD62F105D);
                d=GG(d,a,b,c,x[k+10],S22,0x2441453);
                c=GG(c,d,a,b,x[k+15],S23,0xD8A1E681);
                b=GG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);
                a=GG(a,b,c,d,x[k+9], S21,0x21E1CDE6);
                d=GG(d,a,b,c,x[k+14],S22,0xC33707D6);
                c=GG(c,d,a,b,x[k+3], S23,0xF4D50D87);
                b=GG(b,c,d,a,x[k+8], S24,0x455A14ED);
                a=GG(a,b,c,d,x[k+13],S21,0xA9E3E905);
                d=GG(d,a,b,c,x[k+2], S22,0xFCEFA3F8);
                c=GG(c,d,a,b,x[k+7], S23,0x676F02D9);
                b=GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
                a=HH(a,b,c,d,x[k+5], S31,0xFFFA3942);
                d=HH(d,a,b,c,x[k+8], S32,0x8771F681);
                c=HH(c,d,a,b,x[k+11],S33,0x6D9D6122);
                b=HH(b,c,d,a,x[k+14],S34,0xFDE5380C);
                a=HH(a,b,c,d,x[k+1], S31,0xA4BEEA44);
                d=HH(d,a,b,c,x[k+4], S32,0x4BDECFA9);
                c=HH(c,d,a,b,x[k+7], S33,0xF6BB4B60);
                b=HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
                a=HH(a,b,c,d,x[k+13],S31,0x289B7EC6);
                d=HH(d,a,b,c,x[k+0], S32,0xEAA127FA);
                c=HH(c,d,a,b,x[k+3], S33,0xD4EF3085);
                b=HH(b,c,d,a,x[k+6], S34,0x4881D05);
                a=HH(a,b,c,d,x[k+9], S31,0xD9D4D039);
                d=HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);
                c=HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);
                b=HH(b,c,d,a,x[k+2], S34,0xC4AC5665);
                a=II(a,b,c,d,x[k+0], S41,0xF4292244);
                d=II(d,a,b,c,x[k+7], S42,0x432AFF97);
                c=II(c,d,a,b,x[k+14],S43,0xAB9423A7);
                b=II(b,c,d,a,x[k+5], S44,0xFC93A039);
                a=II(a,b,c,d,x[k+12],S41,0x655B59C3);
                d=II(d,a,b,c,x[k+3], S42,0x8F0CCC92);
                c=II(c,d,a,b,x[k+10],S43,0xFFEFF47D);
                b=II(b,c,d,a,x[k+1], S44,0x85845DD1);
                a=II(a,b,c,d,x[k+8], S41,0x6FA87E4F);
                d=II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);
                c=II(c,d,a,b,x[k+6], S43,0xA3014314);
                b=II(b,c,d,a,x[k+13],S44,0x4E0811A1);
                a=II(a,b,c,d,x[k+4], S41,0xF7537E82);
                d=II(d,a,b,c,x[k+11],S42,0xBD3AF235);
                c=II(c,d,a,b,x[k+2], S43,0x2AD7D2BB);
                b=II(b,c,d,a,x[k+9], S44,0xEB86D391);
                a=AddUnsigned(a,AA);
                b=AddUnsigned(b,BB);
                c=AddUnsigned(c,CC);
                d=AddUnsigned(d,DD);
            }

            var temp = WordToHex(a)+WordToHex(b)+WordToHex(c)+WordToHex(d);

            return temp.toLowerCase();
        }
    };
})();
/*
 * Copyright 2008 Netflix, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* Here's some JavaScript software for implementing OAuth.

   This isn't as useful as you might hope.  OAuth is based around
   allowing tools and websites to talk to each other.  However,
   JavaScript running in web browsers is hampered by security
   restrictions that prevent code running on one website from
   accessing data stored or served on another.

   Before you start hacking, make sure you understand the limitations
   posed by cross-domain XMLHttpRequest.

   On the bright side, some platforms use JavaScript as their
   language, but enable the programmer to access other web sites.
   Examples include Google Gadgets, and Microsoft Vista Sidebar.
   For those platforms, this library should come in handy.
*/

// The HMAC-SHA1 signature method calls b64_hmac_sha1, defined by
// http://pajhome.org.uk/crypt/md5/sha1.js

/* An OAuth message is represented as an object like this:
   {method: "GET", action: "http://server.com/path", parameters: ...}

   The parameters may be either a map {name: value, name2: value2}
   or an Array of name-value pairs [[name, value], [name2, value2]].
   The latter representation is more powerful: it supports parameters
   in a specific sequence, or several parameters with the same name;
   for example [["a", 1], ["b", 2], ["a", 3]].

   Parameter names and values are NOT percent-encoded in an object.
   They must be encoded before transmission and decoded after reception.
   For example, this message object:
   {method: "GET", action: "http://server/path", parameters: {p: "x y"}}
   ... can be transmitted as an HTTP request that begins:
   GET /path?p=x%20y HTTP/1.0
   (This isn't a valid OAuth request, since it lacks a signature etc.)
   Note that the object "x y" is transmitted as x%20y.  To encode
   parameters, you can call OAuth.addToURL, OAuth.formEncode or
   OAuth.getAuthorization.

   This message object model harmonizes with the browser object model for
   input elements of an form, whose value property isn't percent encoded.
   The browser encodes each value before transmitting it. For example,
   see consumer.setInputs in example/consumer.js.
 */

/* This script needs to know what time it is. By default, it uses the local
   clock (new Date), which is apt to be inaccurate in browsers. To do
   better, you can load this script from a URL whose query string contains
   an oauth_timestamp parameter, whose value is a current Unix timestamp.
   For example, when generating the enclosing document using PHP:

   <script src="oauth.js?oauth_timestamp=<?=time()?>" ...

   Another option is to call OAuth.correctTimestamp with a Unix timestamp.
 */
/**
 * @ignore
 */

var OAuth; if (OAuth == null) OAuth = {};

OAuth.setProperties = function setProperties(into, from) {
    if (into != null && from != null) {
        for (var key in from) {
            into[key] = from[key];
        }
    }
    return into;
}


OAuth.setProperties(OAuth, // utility functions
{
    percentEncode: function percentEncode(s) {
        if (s == null) {
            return "";
        }
        if (s instanceof Array) {
            var e = "";
            for (var i = 0; i < s.length; ++s) {
                if (e != "") e += '&';
                e += OAuth.percentEncode(s[i]);
            }
            return e;
        }
        s = encodeURIComponent(s);
        // Now replace the values which encodeURIComponent doesn't do
        // encodeURIComponent ignores: - _ . ! ~ * ' ( )
        // OAuth dictates the only ones you can ignore are: - _ . ~
        // Source: http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Global_Functions:encodeURIComponent
        s = s.replace(/\!/g, "%21");
        s = s.replace(/\*/g, "%2A");
        s = s.replace(/\'/g, "%27");
        s = s.replace(/\(/g, "%28");
        s = s.replace(/\)/g, "%29");
        return s;
    }
,
    decodePercent: function decodePercent(s) {
        if (s != null) {
            // Handle application/x-www-form-urlencoded, which is defined by
            // http://www.w3.org/TR/html4/interact/forms.html#h-17.13.4.1
            s = s.replace(/\+/g, " ");
        }
        return decodeURIComponent(s);
    }
,
    /* Convert the given parameters to an Array of name-value pairs. */
    getParameterList: function getParameterList(parameters) {
        if (parameters == null) {
            return [];
        }
        if (typeof parameters != "object") {
            return OAuth.decodeForm(parameters + "");
        }
        if (parameters instanceof Array) {
            return parameters;
        }
        var list = [];
        for (var p in parameters) {
            list.push([p, parameters[p]]);
        }
        return list;
    }
,
    /* Convert the given parameters to a map from name to value. */

    getParameterMap: function getParameterMap(parameters) {
        if (parameters == null) {
            return {};
        }
        if (typeof parameters != "object") {
            return OAuth.getParameterMap(OAuth.decodeForm(parameters + ""));
        }
        if (parameters instanceof Array) {
            var map = {};
            for (var p = 0; p < parameters.length; ++p) {
                var key = parameters[p][0];
                if (map[key] === undefined) { // first value wins
                    map[key] = parameters[p][1];
                }
            }
            return map;
        }
        return parameters;
    }
,
    getParameter: function getParameter(parameters, name) {
        if (parameters instanceof Array) {
            for (var p = 0; p < parameters.length; ++p) {
                if (parameters[p][0] == name) {
                    return parameters[p][1]; // first value wins
                }
            }
        } else {
            return OAuth.getParameterMap(parameters)[name];
        }
        return null;
    }
,
    formEncode: function formEncode(parameters) {
        var form = "";
        var list = OAuth.getParameterList(parameters);
        for (var p = 0; p < list.length; ++p) {
            var value = list[p][1];
            if (value == null) value = "";
            if (form != "") form += '&';
            form += OAuth.percentEncode(list[p][0])
              +'='+ OAuth.percentEncode(value);
        }
        return form;
    }
,
    decodeForm: function decodeForm(form) {
        var list = [];
        var nvps = form.split('&');
        for (var n = 0; n < nvps.length; ++n) {
            var nvp = nvps[n];
            if (nvp == "") {
                continue;
            }
            var equals = nvp.indexOf('=');
            var name;
            var value;
            if (equals < 0) {
                name = OAuth.decodePercent(nvp);
                value = null;
            } else {
                name = OAuth.decodePercent(nvp.substring(0, equals));
                value = OAuth.decodePercent(nvp.substring(equals + 1));
            }
            list.push([name, value]);
        }
        return list;
    }
,
    setParameter: function setParameter(message, name, value) {
        var parameters = message.parameters;
        if (parameters instanceof Array) {
            for (var p = 0; p < parameters.length; ++p) {
                if (parameters[p][0] == name) {
                    if (value === undefined) {
                        parameters.splice(p, 1);
                    } else {
                        parameters[p][1] = value;
                        value = undefined;
                    }
                }
            }
            if (value !== undefined) {
                parameters.push([name, value]);
            }
        } else {
            parameters = OAuth.getParameterMap(parameters);
            parameters[name] = value;
            message.parameters = parameters;
        }
    }
,
    setParameters: function setParameters(message, parameters) {
        var list = OAuth.getParameterList(parameters);
        for (var i = 0; i < list.length; ++i) {
            OAuth.setParameter(message, list[i][0], list[i][1]);
        }
    }
,
    /* Fill in parameters to help construct a request message.
        This function doesn't fill in every parameter.
        The accessor object should be like:
        {consumerKey:'foo', consumerSecret:'bar', accessorSecret:'nurn', token:'krelm', tokenSecret:'blah'}
        The accessorSecret property is optional.
     */
    completeRequest: function completeRequest(message, accessor) {
        if (message.method == null) {
            message.method = "GET";
        }
        var map = OAuth.getParameterMap(message.parameters);
        if (map.oauth_consumer_key == null) {
            OAuth.setParameter(message, "oauth_consumer_key", accessor.consumerKey || "");
        }
        if (map.oauth_token == null && accessor.access_token != null) {
            OAuth.setParameter(message, "oauth_token", accessor.access_token);
        }
        if (map.oauth_version == null) {
            OAuth.setParameter(message, "oauth_version", "1.0");
        }
        if (map.oauth_timestamp == null) {
            OAuth.setParameter(message, "oauth_timestamp", OAuth.timestamp());
        }
        if (map.oauth_nonce == null) {
            OAuth.setParameter(message, "oauth_nonce", OAuth.nonce(6));
        }

         if (map.oauth_callback == null) {
            OAuth.setParameter(message, "oauth_callback", "oob");
        }

        OAuth.SignatureMethod.sign(message, accessor);
    }
,
    setTimestampAndNonce: function setTimestampAndNonce(message) {
        OAuth.setParameter(message, "oauth_timestamp", OAuth.timestamp());
        OAuth.setParameter(message, "oauth_nonce", OAuth.nonce(6));
    }
,
    addToURL: function addToURL(url, parameters) {
        newURL = url;
        if (parameters != null) {
            var toAdd = OAuth.formEncode(parameters);
            if (toAdd.length > 0) {
                var q = url.indexOf('?');
                if (q < 0) newURL += '?';
                else       newURL += '&';
                newURL += toAdd;
            }
        }
        return newURL;
    }
,
    /* Construct the value of the Authorization header for an HTTP request. */
    getAuthorizationHeader: function getAuthorizationHeader(realm, parameters) {
        var header = 'OAuth realm="' + OAuth.percentEncode(realm) + '"';
        var list = OAuth.getParameterList(parameters);
        for (var p = 0; p < list.length; ++p) {
            var parameter = list[p];
            var name = parameter[0];
            if (name.indexOf("oauth_") == 0) {
                header += ',' + OAuth.percentEncode(name) + '="' + OAuth.percentEncode(parameter[1]) + '"';
            }
        }
        return header;
    }
,
    /* Correct the time using a parameter from the URL from which the last script was loaded. */
    correctTimestampFromSrc: function correctTimestampFromSrc(parameterName) {
        parameterName = parameterName || "oauth_timestamp";
        var scripts = document.getElementsByTagName('script');
        if (scripts == null || !scripts.length) return;
        var src = scripts[scripts.length-1].src;
        if (!src) return;
        var q = src.indexOf("?");
        if (q < 0) return;
        parameters = OAuth.getParameterMap(OAuth.decodeForm(src.substring(q+1)));
        var t = parameters[parameterName];
        if (t == null) return;
        OAuth.correctTimestamp(t);
    }
,
    /* Generate timestamps starting with the given value. */
    correctTimestamp: function correctTimestamp(timestamp) {
        OAuth.timeCorrectionMsec = (timestamp * 1000) - (new Date()).getTime();
    }
,
    /* The difference between the correct time and my clock. */
    timeCorrectionMsec: 0
,
    timestamp: function timestamp() {
        var t = (new Date()).getTime() + OAuth.timeCorrectionMsec;
        return Math.floor(t / 1000);
    }
,
    nonce: function nonce(length) {
        var chars = OAuth.nonce.CHARS;
        var result = "";
        for (var i = 0; i < length; ++i) {
            var rnum = Math.floor(Math.random() * chars.length);
            result += chars.substring(rnum, rnum+1);
        }
        return result;
    }
});

OAuth.nonce.CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";

/* Define a constructor function,
    without causing trouble to anyone who was using it as a namespace.
    That is, if parent[name] already existed and had properties,
    copy those properties into the new constructor.
 */
OAuth.declareClass = function declareClass(parent, name, newConstructor) {
    var previous = parent[name];
    parent[name] = newConstructor;
    if (newConstructor != null && previous != null) {
        for (var key in previous) {
            if (key != "prototype") {
                newConstructor[key] = previous[key];
            }
        }
    }
    return newConstructor;
}

/* An abstract algorithm for signing messages. */
OAuth.declareClass(OAuth, "SignatureMethod", function OAuthSignatureMethod(){});

OAuth.setProperties(OAuth.SignatureMethod.prototype, // instance members
{
    /* Add a signature to the message. */
    sign: function sign(message) {
        var baseString = OAuth.SignatureMethod.getBaseString(message);
        var signature = this.getSignature(baseString);
        OAuth.setParameter(message, "oauth_signature", signature);
        return signature; // just in case someone's interested
    }
,
    /* Set the key string for signing. */
    initialize: function initialize(name, accessor) {
        var consumerSecret;
        if (accessor.accessorSecret != null
            && name.length > 9
            && name.substring(name.length-9) == "-Accessor")
        {
            consumerSecret = accessor.accessorSecret;
        } else {
            consumerSecret = accessor.consumerSecret;
        }
        this.key = OAuth.percentEncode(consumerSecret)
             +"&"+ OAuth.percentEncode(accessor.tokenSecret);
    }
});

/* SignatureMethod expects an accessor object to be like this:
   {tokenSecret: "lakjsdflkj...", consumerSecret: "QOUEWRI..", accessorSecret: "xcmvzc..."}
   The accessorSecret property is optional.
 */
// Class members:
OAuth.setProperties(OAuth.SignatureMethod, // class members
{
    sign: function sign(message, accessor) {
        var name = OAuth.getParameterMap(message.parameters).oauth_signature_method;
        if (name == null || name == "") {
            name = "HMAC-SHA1";
            OAuth.setParameter(message, "oauth_signature_method", name);
        }
        OAuth.SignatureMethod.newMethod(name, accessor).sign(message);
    }
,
    /* Instantiate a SignatureMethod for the given method name. */
    newMethod: function newMethod(name, accessor) {
        var impl = OAuth.SignatureMethod.REGISTERED[name];
        if (impl != null) {
            var method = new impl();
            method.initialize(name, accessor);
            return method;
        }
        var err = new Error("signature_method_rejected");
        var acceptable = "";
        for (var r in OAuth.SignatureMethod.REGISTERED) {
            if (acceptable != "") acceptable += '&';
            acceptable += OAuth.percentEncode(r);
        }
        err.oauth_acceptable_signature_methods = acceptable;
        throw err;
    }
,
    /* A map from signature method name to constructor. */
    REGISTERED : {}
,
    /* Subsequently, the given constructor will be used for the named methods.
        The constructor will be called with no parameters.
        The resulting object should usually implement getSignature(baseString).
        You can easily define such a constructor by calling makeSubclass, below.
     */
    registerMethodClass: function registerMethodClass(names, classConstructor) {
        for (var n = 0; n < names.length; ++n) {
            OAuth.SignatureMethod.REGISTERED[names[n]] = classConstructor;
        }
    }
,
    /* Create a subclass of OAuth.SignatureMethod, with the given getSignature function. */
    makeSubclass: function makeSubclass(getSignatureFunction) {
        var superClass = OAuth.SignatureMethod;
        var subClass = function() {
            superClass.call(this);
        };
        subClass.prototype = new superClass();
        // Delete instance variables from prototype:
        // delete subclass.prototype... There aren't any.
        subClass.prototype.getSignature = getSignatureFunction;
        subClass.prototype.constructor = subClass;
        return subClass;
    }
,
    getBaseString: function getBaseString(message) {
        var URL = message.action;
        var q = URL.indexOf('?');
        var parameters;
        if (q < 0) {
            parameters = message.parameters;
        } else {
            // Combine the URL query string with the other parameters:
            parameters = OAuth.decodeForm(URL.substring(q + 1));
            var toAdd = OAuth.getParameterList(message.parameters);
            for (var a = 0; a < toAdd.length; ++a) {
                parameters.push(toAdd[a]);
            }
        }
        return OAuth.percentEncode(message.method.toUpperCase())
         +'&'+ OAuth.percentEncode(OAuth.SignatureMethod.normalizeUrl(URL))
         +'&'+ OAuth.percentEncode(OAuth.SignatureMethod.normalizeParameters(parameters));
    }
,
    normalizeUrl: function normalizeUrl(url) {
        var uri = OAuth.SignatureMethod.parseUri(url);
        var scheme = uri.protocol.toLowerCase();
        var authority = uri.authority.toLowerCase();
        var dropPort = (scheme == "http" && uri.port == 80)
                    || (scheme == "https" && uri.port == 443);
        if (dropPort) {
            // find the last : in the authority
            var index = authority.lastIndexOf(":");
            if (index >= 0) {
                authority = authority.substring(0, index);
            }
        }
        var path = uri.path;
        if (!path) {
            path = "/"; // conforms to RFC 2616 section 3.2.2
        }
        // we know that there is no query and no fragment here.
        return scheme + "://" + authority + path;
    }
,
    parseUri: function parseUri (str) {
        /* This function was adapted from parseUri 1.2.1
           http://stevenlevithan.com/demo/parseuri/js/assets/parseuri.js
         */
        var o = {key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
                 parser: {strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@\/]*):?([^:@\/]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/ }};
        var m = o.parser.strict.exec(str);
        var uri = {};
        var i = 14;
        while (i--) uri[o.key[i]] = m[i] || "";
        return uri;
    }
,
    normalizeParameters: function normalizeParameters(parameters) {
        if (parameters == null) {
            return "";
        }
        var list = OAuth.getParameterList(parameters);
        var sortable = [];
        for (var p = 0; p < list.length; ++p) {
            var nvp = list[p];
            if (nvp[0] != "oauth_signature") {
                sortable.push([ OAuth.percentEncode(nvp[0])
                              + " " // because it comes before any character that can appear in a percentEncoded string.
                              + OAuth.percentEncode(nvp[1])
                              , nvp]);
            }
        }
        sortable.sort(function(a,b) {
                          if (a[0] < b[0]) return  -1;
                          if (a[0] > b[0]) return 1;
                          return 0;
                      });
        var sorted = [];
        for (var s = 0; s < sortable.length; ++s) {
            sorted.push(sortable[s][1]);
        }
        return OAuth.formEncode(sorted);
    }
});

OAuth.SignatureMethod.registerMethodClass(["PLAINTEXT", "PLAINTEXT-Accessor"],
    OAuth.SignatureMethod.makeSubclass(
        function getSignature(baseString) {
            return this.key;
        }
    ));

OAuth.SignatureMethod.registerMethodClass(["HMAC-SHA1", "HMAC-SHA1-Accessor"],
    OAuth.SignatureMethod.makeSubclass(
        function getSignature(baseString) {
            b64pad = '=';
            var signature = b64_hmac_sha1(this.key, baseString);
            return signature;
        }
    ));

try {
    OAuth.correctTimestampFromSrc();
} catch(e) {
}
;
/*
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined
 * in FIPS PUB 180-1
 * Version 2.1a Copyright Paul Johnston 2000 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for details.
 */

/*
 * Configurable variables. You may need to tweak these to be compatible with
 * the server-side, but the defaults work in most cases.
 */

var hexcase = 0;  /* hex output format. 0 - lowercase; 1 - uppercase        */
var b64pad  = ""; /* base-64 pad character. "=" for strict RFC compliance   */
var chrsz   = 8;  /* bits per input character. 8 - ASCII; 16 - Unicode      */

/*
 * These are the functions you'll usually want to call
 * They take string arguments and return either hex or base-64 encoded strings
 */
function hex_sha1(s){return binb2hex(core_sha1(str2binb(s),s.length * chrsz));}
function b64_sha1(s){return binb2b64(core_sha1(str2binb(s),s.length * chrsz));}
function str_sha1(s){return binb2str(core_sha1(str2binb(s),s.length * chrsz));}
function hex_hmac_sha1(key, data){ return binb2hex(core_hmac_sha1(key, data));}
function b64_hmac_sha1(key, data){ return binb2b64(core_hmac_sha1(key, data));}
function str_hmac_sha1(key, data){ return binb2str(core_hmac_sha1(key, data));}

/*
 * Perform a simple self-test to see if the VM is working
 */
function sha1_vm_test()
{
  return hex_sha1("abc") == "a9993e364706816aba3e25717850c26c9cd0d89d";
}

/*
 * Calculate the SHA-1 of an array of big-endian words, and a bit length
 */
function core_sha1(x, len)
{
  /* append padding */
  x[len >> 5] |= 0x80 << (24 - len % 32);
  x[((len + 64 >> 9) << 4) + 15] = len;

  var w = Array(80);
  var a =  1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d =  271733878;
  var e = -1009589776;

  for(var i = 0; i < x.length; i += 16)
  {
    var olda = a;
    var oldb = b;
    var oldc = c;
    var oldd = d;
    var olde = e;

    for(var j = 0; j < 80; j++)
    {
      if(j < 16) w[j] = x[i + j];
      else w[j] = rol(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1);
      var t = safe_add(safe_add(rol(a, 5), sha1_ft(j, b, c, d)),
                       safe_add(safe_add(e, w[j]), sha1_kt(j)));
      e = d;
      d = c;
      c = rol(b, 30);
      b = a;
      a = t;
    }

    a = safe_add(a, olda);
    b = safe_add(b, oldb);
    c = safe_add(c, oldc);
    d = safe_add(d, oldd);
    e = safe_add(e, olde);
  }
  return Array(a, b, c, d, e);

}

/*
 * Perform the appropriate triplet combination function for the current
 * iteration
 */
function sha1_ft(t, b, c, d)
{
  if(t < 20) return (b & c) | ((~b) & d);
  if(t < 40) return b ^ c ^ d;
  if(t < 60) return (b & c) | (b & d) | (c & d);
  return b ^ c ^ d;
}

/*
 * Determine the appropriate additive constant for the current iteration
 */
function sha1_kt(t)
{
  return (t < 20) ?  1518500249 : (t < 40) ?  1859775393 :
         (t < 60) ? -1894007588 : -899497514;
}

/*
 * Calculate the HMAC-SHA1 of a key and some data
 */
function core_hmac_sha1(key, data)
{
  var bkey = str2binb(key);
  if(bkey.length > 16) bkey = core_sha1(bkey, key.length * chrsz);

  var ipad = Array(16), opad = Array(16);
  for(var i = 0; i < 16; i++)
  {
    ipad[i] = bkey[i] ^ 0x36363636;
    opad[i] = bkey[i] ^ 0x5C5C5C5C;
  }

  var hash = core_sha1(ipad.concat(str2binb(data)), 512 + data.length * chrsz);
  return core_sha1(opad.concat(hash), 512 + 160);
}

/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
function safe_add(x, y)
{
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
}

/*
 * Bitwise rotate a 32-bit number to the left.
 */
function rol(num, cnt)
{
  return (num << cnt) | (num >>> (32 - cnt));
}

/*
 * Convert an 8-bit or 16-bit string to an array of big-endian words
 * In 8-bit function, characters >255 have their hi-byte silently ignored.
 */
function str2binb(str)
{
  var bin = Array();
  var mask = (1 << chrsz) - 1;
  for(var i = 0; i < str.length * chrsz; i += chrsz)
    bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (32 - chrsz - i%32);
  return bin;
}

/*
 * Convert an array of big-endian words to a string
 */
function binb2str(bin)
{
  var str = "";
  var mask = (1 << chrsz) - 1;
  for(var i = 0; i < bin.length * 32; i += chrsz)
    str += String.fromCharCode((bin[i>>5] >>> (32 - chrsz - i%32)) & mask);
  return str;
}

/*
 * Convert an array of big-endian words to a hex string.
 */
function binb2hex(binarray)
{
  var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
  var str = "";
  for(var i = 0; i < binarray.length * 4; i++)
  {
    str += hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8+4)) & 0xF) +
           hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8  )) & 0xF);
  }
  return str;
}

/*
 * Convert an array of big-endian words to a base-64 string
 */
function binb2b64(binarray)
{
  var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var str = "";
  for(var i = 0; i < binarray.length * 4; i += 3)
  {
    var triplet = (((binarray[i   >> 2] >> 8 * (3 -  i   %4)) & 0xFF) << 16)
                | (((binarray[i+1 >> 2] >> 8 * (3 - (i+1)%4)) & 0xFF) << 8 )
                |  ((binarray[i+2 >> 2] >> 8 * (3 - (i+2)%4)) & 0xFF);
    for(var j = 0; j < 4; j++)
    {
      if(i * 8 + j * 6 > binarray.length * 32) str += b64pad;
      else str += tab.charAt((triplet >> 6*(3-j)) & 0x3F);
    }
  }
  return str;
}

/*********************************************************************************************************/
/*****************************ADDED FOR ZENFOLIO ********************************************************/
/*********************************************************************************************************/

var sha256Init = [ 0x6A09E667, -0x4498517B, 0x3C6EF372, -0x5AB00AC6, 0x510E527F, -0x64FA9774, 0x1F83D9AB, 0x5BE0CD19 ];
var sha256Roots = [ 0x428A2F98, 0x71374491, -0x4A3F0431, -0x164A245B, 0x3956C25B, 0x59F111F1, -0x6DC07D5C, -0x54E3A12B, -0x27F85568, 0x12835B01, 0x243185BE, 0x550C7DC3, 0x72BE5D74, -0x7F214E02, -0x6423F959, -0x3E640E8C, -0x1B64963F, -0x1041B87A, 0x0FC19DC6, 0x240CA1CC, 0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA, -0x67C1AEAE, -0x57CE3993, -0x4FFCD838, -0x40A68039, -0x391FF40D, -0x2A586EB9, 0x06CA6351, 0x14292967, 0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13, 0x650A7354, 0x766A0ABB, -0x7E3D36D2, -0x6D8DD37B, -0x5D40175F, -0x57E599B5, -0x3DB47490, -0x3893AE5D, -0x2E6D17E7, -0x2966F9DC, -0x0BF1CA7B, 0x106AA070, 0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5, 0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3, 0x748F82EE, 0x78A5636F, -0x7B3787EC, -0x7338FDF8, -0x6F410006, -0x5BAF9315, -0x41065C09, -0x398E870E ];
var sha256Tail = [ 0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 ];

function sha256(data) {
	data = sha256Pad(data);
	var res = sha256Init.slice(0);
	var s = data.length;
	var k = 0;
	do {
		var k2 = k + 16;
		sha256Round(res,data.slice(k, k2));
		k = k2;
	}
	while (k < s);
	var out = [];
	s = res.length;
	for (var i = 0; i < s;i++) {
		var w = res[i];
		out.push((w >>> 24) & 0xFF);
		out.push((w >>> 16) & 0xFF);
		out.push((w >>>8) & 0xFF);
		out.push(w & 0xFF);
	}

	return out;
}

function sha256Pad(data)
{
	var blen = data.length * 8;
	var len = ((data.length + 72) & ~63) - 8;
	data = data.concat(sha256Tail.slice(0,len - data.length));
	var out = [];
	var i = 0;
	do {
		var w = data[i++] << 24;
		w |= data[i++] << 16;
		w |= data[i++] << 8;
		w |= data[i++];
		out.push(w);
	} while (i < len);
	out.push(0);
	out.push(blen);
	return out;
}

function sha256Round(res, data)
{
	for (var i = 16; i < 64; i++) {
		var x = data[i- 15];
		var y = data[i - 2];
		var x7 = (x >>> 7) | (x << 25);
		var x18 = (x >>> 18) | (x << 14);
		var y17 = (y >>> 17) | (y << 15);
		var y19 = (y >>> 19) | (y << 13);
		var s0 = x7 ^ x18 ^ (x >>> 3);
		var s1 = y17 ^ y19 ^ (y >>> 10);
		data.push((data[i - 16] + s0 + data[i - 7] + s1) & -1);
	}

	var a = res[0];
	var b = res[1];
	var c = res[2];
	var d = res[3];
	var e = res[4];
	var f = res[5];
	var g = res[6];
	var h = res[7];

	for (i = 0; i < 64; i++) {
		var a2 = (a >>> 2) | (a << 30);
		var a13 = (a >>> 13) | (a << 19);
		var a22 = (a >>> 22) | (a << 10);
		var e6 = (e >>> 6) | (e << 26);
		var e11 = (e >>> 11) | (e << 21);
		var e25 = (e >>> 25) | (e << 7);
		var ss0 = a2 ^ a13 ^ a22;
		var maj = (a & b) ^ (a & c) ^ (b & c);
		var t2 = ss0 + maj;
		var ss1 = e6 ^ e11 ^ e25;
		var ch = (e & f) ^ (~e & g);
		var t1 = h + ss1 + ch + sha256Roots[i] + data[i];
		h = g;
		g = f;
		f = e;
		e = (d + t1) & -1;
		d = c;
		c = b;
		b = a;
		a = (t1 + t2) & -1;
	}

	res[0] = (res[0] + a) & -1;
	res[1] = (res[1] + b) & -1;
	res[2] = (res[2] + c) & -1;
	res[3] = (res[3] + d) & -1;
	res[4] = (res[4] + e) & -1;
	res[5] = (res[5] + f) & -1;
	res[6] = (res[6] + g) & -1;
	res[7] = (res[7] + h) & -1;
}
;
/**
 * @class
 * @name Asset
 * @namespace SBW.Models.Asset
 * @property {String} type  Define the asset type
 * @property {String} id  Id of an asset
 * @property {String} title  Title of an asset
 * @property {String} createdTime  Created time for an asset
 * @property {String} serviceName Service name of the asset
 * @property {Object} rawData  Raw data of an asset
 * @property {String} status  Status of an asset
 * @property {Object} imgSizes Image size object
 * @property {Object} metadata Metadata object of an asset
 *
 * @classdesc This is asset Model Class
 * @constructor
 */

SBW.Models.Asset = SBW.Object.extend(/** @lends SBW.Models.Asset# */{
  type:'asset',
  id:'',
  title:'',
  createdTime:'',
  serviceName:null,
  rawData:[],
  status:'private',
  /**
     * @inner
     * @type {Object}
     * @property {String} t Thumbnail image url
     * @property {String} s Small image url
     * @property {String} m Medium image url
     * @property {String} l Large image url
   *
   **/
  imgSizes:{t:'', s:'', m:'', l:''},
  /**
   * @inner
   * @type {Object}
   * @desc define the asset meta data
   *
   * @property {String} caption Caption of an asset
   * @property {String} dateTaken Date taken of an asset
   * @property {String} dateUpdated Date updated of an asset
   * @property {String} dateUploaded Date uploaded of an asset
   * @property {Object} comments Comments on an asset
   * @property {String} size Size of an asset
   * @property {String} assetId Id of an asset from the service
   * @property {String} assetCollectionId Collection id of the of asset from service
   * @property {Number} height Height of an asset
   * @property {Number} width Width of an asset
   * @property {Number} commentCount Comment count
   * @property {String} Category Category of a asset
   * @property {String} exifMake Exif make data of asset
   * @property {String} exifModel Exif model data of asset
   * @property {String} iptcKeywords iptc keyword of asset
   * @property {String} orientation Orientation of asset
   * @property {String} tags Tags of an asset
   * @property {String} downloadUrl Download url of an asset
   * @property {String} originalFormat Original format of an asset
   * @property {String} fileName File name of an asset
   * @property {String} version Version of an asset
   * @property {String} description Description of the asset
   * @property {String} thumbnail Thumbnail of the asset
   * @property {String} previewUrl Preview url of the asset
   * @property {String} author Author of the asset
   * @property {String} authorAvatar Author avatar of the asset
   * @property {Number} likeCount like count of an asset
   * @property {Array} likes like object of an asset
   *
   **/
  metadata:{
    caption:null,
    type:null,
    dateTaken:null,
    dateUpdated:null,
    dateUploaded:null,
    comments:null,
    size:null,
    assetId:null,
    assetCollectionId:null,
    height:null,
    width:null,
    commentCount:null,
    category:null,
    exifMake:null,
    exifModel:null,
    iptcKeywords:null,
    orientation:null,
    tags:null,
    downloadUrl:null,
    originalFormat:null,
    fileName:null,
    version:null,
    description:null,
    thumbnail:null,
    previewUrl:null,
    author:null,
    authorAvatar:null,
    likeCount:0,
    likes:null
  },
  /**
   * @method
   * @desc Initialize the properties of an asset
   * @param {prop} property of the object
   */
  init:function (prop)
  {
    for (var p in prop) {
      this.constructor[p] = prop[p];
    }
  },
  /**
   * @method
   * @desc utility method to generate the id of asset object
   * @returns {string} id
   */
  getID:function ()
  {
    return this.type + Math.floor(Math.random() * 1000);
  }
});

/**
 * @class
 * @name AssetCollection
 * @namespace SBW.Models.AssetCollection
 * @property {String} id  Id of the asset collection
 * @property {String} title  Title of the asset collection
 * @property {String} createdTime  Created time of the asset collection
 * @property {Object} rawData  Raw data of the asset collection
 * @property {String} status  Status of the asset collection
 * @property {String} serviceName Service name of the asset collection
 * @property {Array}  assets Array of {@link SBW.Models.Asset Assets} in the asset collection
 * @property {Object} metadata Metadata object of the asset collection
 * @classdesc This is an asset collection class
 * @constructor
 */

SBW.Models.AssetCollection = SBW.Object.extend(/** @lends SBW.Models.AssetCollection# */{
  id:'',
  title:'',
  createdTime:'',
  rawData:[],
  status:'private',
  serviceName:null,
  assets: [],
  /**
   * @inner
   * @type {Object}
   * @desc define the AssetCollection meta data
   *
   * @property {String} dateUpdated Date updated of the asset collection
   * @property {String} dateUploaded Date uploaded of the asset collection
   * @property {Number} numAssets Number of Assets in the asset collection
   * @property {String} assetCollectionId Id of the asset collection from the service
   * @property {String} Type type of the asset collection
   * @property {String} tags Tags of the asset collection
   * @property {String} fileName File name of the asset collection
   * @property {String} description Description of the asset collection
   * @property {String} thumbnail Thumbnail of the asset collection
   * @property {String} previewUrl Preview url of the asset collection
   * @property {String} author Author of the asset collection
   * @property {String} authorAvatar Author avatar of the asset collection
   * @property {Number} commentCount Comment count of the asset collection
   * @property {Object} comments Comments on an asset collection
   * @property {Number} likeCount like count of an asset collection
   * @property {Array} likes like object of an asset collection
   *
   **/
  metadata:{
    dateUpdated:null,
    dateUploaded:null,
    numAssets:null,
    assetCollectionId:null,
    type:null,
    tags:null,
    fileName:null,
    description:null,
    thumbnail:null,
    previewUrl:null,
    author:null,
    authorAvatar:null,
    commentCount:null,
    comments:null,
    likeCount:0,
    likes:null
  },
  /**
   * @method
   * @desc Initialize the properties of the asset collection
   * @param {prop} property of the object
   */
  init:function (prop)
  {
    for (var p in prop) {
      this.constructor[p] = prop[p];
    }
  },
  /**
   * @method
   * @desc utility method to generate the id of asset collection object
   * @returns {string} id
   */
  getID:function ()
  {
    return 'collection' + Math.floor(Math.random() * 1000);
  }
});

/**
 * @class
 * @name AudioAsset
 * @namespace SBW.Models.AudioAsset
 * @classdesc This is an audio asset model
 * @property {String} [type = 'audio'] - Audio asset type
 * @property {String} url - Audio url for playback
 * @property {Number} duration - Duration of the audio playback
 * @augments Asset
 * @constructor
 */

SBW.Models.AudioAsset = SBW.Models.Asset.extend(/** @lends SBW.Models.AudioAsset# */{
  type: 'audio',
  url :'',
  duration: 0
});
/**
 * @class
 * @name Comment
 * @namespace SBW.Models.Comment
 * @classdesc This is Comment Model Class
 * @property {String} text  Text Content of the comment
 * @property {String} id  Id of the comment
 * @property {String} createTime  Time in string format
 * @property {String} fromUser User name
 * @property {String} likeCount Number of likes for the comment
 * @property {String} userImage Url of the User Image
 * @property {Object} rawData Raw data from the serivce(eg. facebook, twitter)
 * @property {String} serviceName  Name of the service(eg. facebook, twitter)
 * @constructor
 */

SBW.Models.Comment = SBW.Object.extend(/** @lends SBW.Models.Comment# */{
  text: '',
  id: '',
  createdTime: null,
  fromUser: "",
  likeCount: null,
  userImage: "",
  rawData: null,
  serviceName: '',
  fromUserId:''
});
/**
 * @class
 * @name Error
 * @namespace SBW.Models.Error
 * @classdesc This is Error Model Class
 * @property {String} message  Text Content of the Error message
 * @property {String} code  Error code of the error message
 * @property {String} serviceName  Name of the service(eg. facebook, twitter)
 * @property {Object} rawData Raw data from the serivce(eg. facebook, twitter)
 * @constructor
 */

SBW.Models.Error = SBW.Object.extend(/** @lends SBW.Models.Error# */ {
  message: '',
  code: null,
  serviceName:'',
  rawData:null
});
/**
 * @class
 * @name ImageAsset
 * @namespace SBW.Models.ImageAsset
 * @classdesc This is an image asset model
 * @property {String} [type = 'image'] - Image asset type
 * @property {String} src - Image source url
 * @augments Asset
 * @constructor
 */

SBW.Models.ImageAsset = SBW.Models.Asset.extend(/** @lends SBW.Models.ImageAsset# */{
 type: 'image',
 src:""
});

/**
 * @class
 * @name Like
 * @namespace SBW.Models.Like
 * @classdesc This is Like(Favorite) Model Class
 * @property {String} user User object
 * @property {Object} rawData Raw data from the serivce(eg. facebook, twitter)
 * @constructor
 */

SBW.Models.Like = SBW.Object.extend(/** @lends SBW.Models.Like# */ {
  user: [],
  rawData:null
});
/**
 * @class
 * @name UploadFileMetaData
 * @namespace SBW.Models.UploadFileMetaData
 * @classdesc This is Upload File MetaData Model Class
 * @property {String} description - Description of the file
 * @property {String} title - Title of the file
 * @property {String} location - geo location metadata of the file
 * @property {Object} file - File Object
 * @constructor
 */

SBW.Models.UploadFileMetaData = SBW.Object.extend(/** @lends SBW.Models.UploadFileMetaData# */ {
  title: "",
  description: "",
  location: "",
  file: null
});
/**
 * @class
 * @name UploadStatus
 * @namespace SBW.Models.UploadStatus
 * @classdesc This is Upload Status Model Class
 * @property {String} serviceName Name of the service
 * @property {String} id  Id
 * @property {String} postId Id of the post object
 * @property {String} status Status of the file upload
 * @property {Object} rawData rawdata from the service
 * @constructor
 */

SBW.Models.UploadStatus = SBW.Object.extend( /** @lends SBW.Models.UploadStatus# */ {
    serviceName: "",
    id: "",
    postId: "",
    status: '',
    rawData:null
});
/**
 * @class User
 * @classdesc This is an user class
 * @property {String} name - User name
 * @property {String} screen_name - User's screen name
 * @property {String} id - User id
 * @property {String} userImage - User profile picture
 * @property {Object} rawData Raw data from the serivce(eg. facebook, twitter)
 * @constructor
 */

SBW.Models.User = SBW.Object.extend(/** @lends SBW.Models.User# */{
  name:null,
  screenName:null,
  id:null,
  userImage:"",
  rawData:null
});
/**
 * @class
 * @name VideoAsset
 * @namespace SBW.Models.VideoAsset
 * @classdesc This is an video asset class
 * @property {String} [type = 'video'] - Video asset type
 * @property {String} url - Video url for playback
 * @property {Number} duration - Duration of the video playback
 * @augments Asset
 * @constructor
 */

SBW.Models.VideoAsset = SBW.Models.Asset.extend(/** @lends SBW.Models.VideoAsset# */{
  type:'video',
  url:'',
  duration:0
});
( function() {"use strict";
		/*jslint nomen: true*/
		/*jslint plusplus: true */
		/*global SBW*/
		/**
		 * @class
		 * @name ServiceFactory
		 * @namespace SBW.Controllers.ServiceFactory
		 * @classdesc  A factory class to handle the initialization/destroy/registration of service.
		 * @constructor
		 */
		SBW.Controllers.ServiceFactory = SBW.Object.extend(/** @lends SBW.Controllers.ServiceFactory# */
		{
			/**
			 * @private
			 * @desc List to hold the registered services.
			 */
			_services : {},
			/**
			 * @method
			 * @desc Method to register the service
			 * @param {String} serviceName  Name of the registered service.
			 * @param {Function}  service The Service Controller class function.
			 * @example
			 * Usage:
			 * SBW.Singletons.serviceFactory.registerService('Twitter', SBW.Controllers.Services['Twitter']);
			 * SBW.Singletons.serviceFactory.registerService('controller', SBW.Controllers.Services.ServiceController);
			 */
			registerService : function(serviceName, service) {
				var utils = new SBW.Utils();
				if (utils.isType(service, Function)) {
					this._services[serviceName] = new service();
				}
			},
			/**
			 * @method
			 * @desc Returns the service from the list of registered services if exists.
			 * @param {String} serviceName  Name of the registered service.
			 * @returns {SBW.Controllers.Services.ServiceController} serviceObject Instance of ServiceController.
			 * @example
			 * Usage:
			 * SBW.Singletons.serviceFactory.getService('Twitter');
			 */
			getService : function(serviceName) {
				return this._services[serviceName];
			}
		});
	}());
// End of IIFE
;
( function() {"use strict";
		/*jslint nomen: true*/
		/*jslint plusplus: true */
		/*global SBW*/
		SBW.init = function(config, callback) {
			
			SBW.Singletons.serviceFactory = new SBW.Controllers.ServiceFactory();
			SBW.logger = new SBW.Logger();
			SBW.Singletons.utils = new SBW.Utils();
			SBW.api = new SBW.Controllers.Services.ServiceController();

			if (SBW.Singletons.utils.isType(config, String)) {
				SBW.Singletons.utils.ajax({
					url : config,
					dataType : 'json'
				}, function(successResponse) {
					initializeServices(successResponse, callback);
				}, function(errorResponse) {
					callback(errorResponse);
				});
			} else if (SBW.Singletons.utils.isType(config, Object)) {
				initializeServices(config, callback);
			}
		};
		
		var initializeServices = function (config, callback) {
			var enabledServices, key, serviceName;
			SBW.Singletons.config = config;
			
			enabledServices = SBW.Singletons.config.services;
			SBW.logger.on = SBW.Singletons.config.debug === 'true' ? true : false;

			for (key in enabledServices) {
				if (enabledServices.hasOwnProperty(key)) {
					serviceName = key.toLowerCase();
					SBW.Singletons.serviceFactory.registerService(serviceName, SBW.Controllers.Services[key]);
					SBW.Singletons.serviceFactory.getService(serviceName).init();
				}
			}
			if(SBW.Singletons.utils.isType(callback, Function)) {
				callback();
			}
		}
	}());
// End of IIFE
;
(function () {
  "use strict";
  /*jslint nomen: true*/
  /*jslint plusplus: true */
  /*global SBW*/
  /**
   * @class
   * @name ServiceController
   * @namespace SBW.Controllers.Services.ServiceController
   * @classdesc A controller class to manage the services.
   * @constructor
   */
  SBW.Controllers.Services.ServiceController = SBW.Object.extend(/** @lends SBW.Controllers.Services.ServiceController# */ {
    /**
     * @private
     * @desc Name of the service.
     * @type {String}
     */
    name: null,
    /**
     * @private
     * @desc User logged in the service.
     * @type {Object}
     */
    user: null,
    /**
     * @private
     * @desc Icon for the service.
     * @type {String}
     */
    icon: null,
    /**
     * @private
     * @desc Title of the service.
     * @type {String}
     */
    title: null,
    /**
     * @private
     * @desc Access object of the service.
     * @type {Object}
     */
    accessObject: [],
    /**
     * @private
     * @type {Boolean}
     * @desc Flag to indicate the user login.
     */
    isUserLoggedIn: false,
    /**
     * @private
     * @type {Boolean}
     * @desc Flag to specify the service is either remote or local.
     */
    isRemoteService: true,
    /**
     * @private
     * @type {Object}
     * @desc File status.
     */
    fileStatus: {},
    /**
     * @private
     */
    _forEach: function (array, callback) {
      if (!this.utils) {
        this.utils = new SBW.Utils();
      }
      this.utils.forEach(array, callback);
    },
    /**
     * @method
     * @desc Initializes the service.
     * @see SBW.Controllers.Services.Facebook
     */
    init: function () {
    },
    /**
     * @method
     * @desc Resets the service object to default values.
     */
    reset: function () {
    },
    /**
     * @method
     * @private
     * @desc The internationalized message for title, openAlbumLabel, seeAllAlbumsLabel. Internal method to be executed by service init method.
     */
    setup: function () {
    },
    /**
     * @method
     * @desc Checks whether the user is logged in / has a authenticated session to service.
     * @param {String} service Service to check for user's authenticated session.
     * @param {Function} callback  Callback function to be executed once the user is logged in.
     */
    checkUserLoggedIn: function (service, callback) {
      SBW.Singletons.serviceFactory.getService(service).checkUserLoggedIn(callback);
    },
    /**
     * @method
     * @desc Update the user object in the service
     * @param {Object} userObject  Object of logged in user
     */
    populateUserInformation: function (userObject) {
      this.user = userObject;
    },
    /**
     * @method
     * @desc Triggers the authentication process.
     * @param {Function} callback  Callback function to be executed once the user is authenticated and connected to the client application.
     */
    startActionHandler: function (callback) {
    },
    /**
     * @method
     * @desc Retrieves access tokens from the response.
     * @param {Object} response  Response from the service.
     * @param {Function} callback  Callback function to be executed after retrieving the access token.
     */
    getAccessToken: function (response, callback) {
    },
    /**
     * @method
     * @desc Handler for login failure.
     * @param {Function} callback Callback function to be executed on authentication failure.
     * @param {String} message Error message to be displayed .
     */
    failureLoginHandler: function (callback, message) {
    },
    /**
     * @method
     * @desc Publishing text message onto the specified services. This method accepts success and error callbacks in the arguments. For each
     * callback the (response) object of the service will be passed as an argument, to process the callback.
     * @param {String[]} serviceArr An array of registered services.
     * @param {String} message  Message to be posted on the service
     * @param {Function} successCallback  {@link SBW.Controllers.Services.ServiceController~publishMessage-successCallback Callback} to be executed on successful message publishing.
     * @param {Function} errorCallback  {@link SBW.Controllers.Services.ServiceController~publishMessage-errorCallback Callback} to be executed on message publishing error
     * @example
     * Usage:
     * SBW.api
     *        .publishMessage(['Facebook','Flickr'], "Sample Message", function(response) {
		 *        // Success callback logic...
		 *        }, function(response) {
		 *         // Error callback logic...
		 *        });
     */
    publishMessage: function (serviceArr, message, successCallback, errorCallback) {
      if (!(serviceArr instanceof Array)) {
        SBW.Singletons.serviceFactory.getService(serviceArr).publishMessage(message, successCallback, errorCallback);
      } else {
        serviceArr.forEach(function (data, index, serviceArr) {
          SBW.Singletons.serviceFactory.getService(data).publishMessage(message, successCallback, errorCallback);
        });
      }
    },
    /**
     * This callback is displayed as part of the publishMessage method.
     * @callback SBW.Controllers.Services.ServiceController~publishMessage-successCallback
     * @param {Object} response JSON response from the service
     **/
    /**
     * This callback is displayed as part of the publishMessage method.
     * @callback SBW.Controllers.Services.ServiceController~publishMessage-errorCallback
     * @param {Object} response JSON response from the service
     **/
    /**
     * @method
     * @desc Publishing text message(with picture,link,actions etc) onto the specified services. This method accepts success and error callbacks in the arguments. For each
     * callback the (response) object of the service will be passed as an argument, to process the callback.
     * @param {String[]} serviceArr An array of registered services.
     * @param {String} postObject object containing the metaData to Post a message
     * @param {Function} successCallback  {@link SBW.Controllers.Services.ServiceController~postShare-successCallback Callback} to be executed on successful message publishing.
     * @param {Function} errorCallback  {@link SBW.Controllers.Services.ServiceController~postShare-errorCallback Callback} to be executed on message publishing error
     */
    postShare: function (serviceArr, postObject, successCallback, errorCallback) {
      if (!(serviceArr instanceof Array)) {
        SBW.Singletons.serviceFactory.getService(serviceArr).postShare(postObject, successCallback, errorCallback);
      } else {
        serviceArr.forEach(function (data, index, serviceArr) {
          SBW.Singletons.serviceFactory.getService(data).postShare(postObject, successCallback, errorCallback);
        });
      }
    },
    /**
     * This callback is displayed as part of the postShare method.
     * @callback SBW.Controllers.Services.ServiceController~postShare-successCallback
     * @param {Object} response JSON response from the service
     **/
    /**
     * This callback is displayed as part of the postShare method.
     * @callback SBW.Controllers.Services.ServiceController~postShare-errorCallback
     * @param {Object} response JSON response from the service
     **/
    /**
     * @method
     * @desc Handler for login success.
     * @param {SBW.User} user  The service user object.
     * @param {Function} callback Callback to be executed on successful login.
     */
    successLoginHandler: function (user, callback) {
      this.set('isUserLoggedIn', true);
      this.set('isUserLoggingIn', false);
      // format the user_id
      if (user) {
        user.set('name', unescape(user.get('name')));
      }
      this.set('user', user);
    },
    /**
     * @method
     * @desc Publishing link onto the specified services.
     * @param  {String[]} serviceArr An array of registered services.
     * @param {String} type Specifies the type of the post e.g.link, photo, video etc..
     * @param {String} name Specifies the name for the link.
     * @param {String} caption The caption to appear beneath the link name.
     * @param {String} message A description message about the link.
     * @param {String} link  The URL link to be attached for this post.
     * @param {String} description The detailed description about the link to appear beneath the link caption.
     * @param {String} picture  The URL link of the picture to be included with this post if available.
     * @param {String} icon The URL link of the icon to represent the type of the post.
     * @param {Function} successCallback {@link SBW.Controllers.Services.ServiceController~publishLink-successCallback Callback} to be executed on successful link publishing.
     * @param {Function} errorCallback  {@link SBW.Controllers.Services.ServiceController~publishLink-errorCallback Callback} to be executed on link publishing error.
     */
    publishLink: function (serviceArr, type, name, caption, message, link, description, picture, icon, successCallback, errorCallback) {
      if (!(serviceArr instanceof Array)) {
        SBW.Singletons.serviceFactory.getService(serviceArr).publishLink(type, name, caption, message, link, description, picture, icon, successCallback, errorCallback);
      } else {
        serviceArr.forEach(function (data, index, serviceArr) {
          SBW.Singletons.serviceFactory.getService(data).publishLink(type, name, caption, message, link, description, picture, icon, successCallback, errorCallback);
        });
      }
    },
    /**
     * This callback is displayed as part of the publishLink method.
     * @callback SBW.Controllers.Services.ServiceController~publishLink-successCallback
     * @param {Object} response JSON response from the service
     **/
    /**
     * This callback is displayed as part of the publishLink method.
     * @callback SBW.Controllers.Services.ServiceController~publishLink-errorCallback
     * @param {Object} response JSON response from the service
     **/
    /**
     * @method
     * @desc Publishing event onto the specified services.
     * @param  {String[]} serviceAr An array of registered services.
     * @param {String} name  Specifies the name of the event.
     * @param {String} startTime Specifies the start time of the event. The date string should be in ISO-8601 formatted date/time.
     * @param {String} endTime Specifies the end time of the event. The date string should be in ISO-8601 formatted date/time.
     * @param {Function} successCallback {@link SBW.Controllers.Services.ServiceController~publishEvent-successCallback Callback} to be executed on successful event publishing.
     * @param {Function} errorCallback {@link SBW.Controllers.Services.ServiceController~publishEvent-errorCallback Callback} to be executed on event publishing error.
     */
    publishEvent: function (serviceArr, name, startTime, endTime, successCallback, errorCallback) {
      if (!(serviceArr instanceof Array)) {
        SBW.Singletons.serviceFactory.getService(serviceArr).publishEvent(name, startTime, endTime, successCallback, errorCallback);
      } else {
        serviceArr.forEach(function (data, index, serviceArr) {
          SBW.Singletons.serviceFactory.getService(data).publishEvent(name, startTime, endTime, successCallback, errorCallback);
        });
      }
    },
    /**
     * This callback is displayed as part of the publishEvent method.
     * @callback SBW.Controllers.Services.ServiceController~publishEvent-successCallback
     * @param {Object} response JSON response from the service
     **/
    /**
     * This callback is displayed as part of the publishEvent method.
     * @callback SBW.Controllers.Services.ServiceController~publishEvent-errorCallback
     * @param {Object} response JSON response from the service
     **/
    /**
     * @method
     * @desc Liking an object onto the specified service.
     * @param {String} serviceName  Name of the registered service.
     * @param {String} objectId  Id of the object liked i.e. post,comment etc..
     * @param {Function} successCallback  {@link SBW.Controllers.Services.ServiceController~like-successCallback Callback} to be executed on object liking in a service succeeds.
     * @param {Function} errorCallback  {@link SBW.Controllers.Services.ServiceController~like-errorCallback Callback} to be executed on object liking error.
     */
    like: function (serviceName, objectId, successCallback, errorCallback) {
      SBW.Singletons.serviceFactory.getService(serviceName).like(objectId, successCallback, errorCallback);
    },
    /**
     * This callback is displayed as part of the like method.
     * @callback SBW.Controllers.Services.ServiceController~like-successCallback
     * @param {Object} response JSON response from the service
     **/
    /**
     * This callback is displayed as part of the like method.
     * @callback SBW.Controllers.Services.ServiceController~like-errorCallback
     * @param {Object} response JSON response from the service
     **/
    /**
     * @method
     * @desc Un liking an object onto the specified service.
     * @param {String} serviceName  Name of the registered service.
     * @param {String} objectId  Id of the object un liked i.e. post,comment etc..
     * @param {Function} successCallback  {@link SBW.Controllers.Services.ServiceController~unlike-successCallback Callback} to be executed on object un liking in a service succeeds.
     * @param {Function} errorCallback  {@link SBW.Controllers.Services.ServiceController~unlike-errorCallback Callback} to be executed on object un liking error.
     */
    unlike: function (serviceName, objectId, successCallback, errorCallback) {
      SBW.Singletons.serviceFactory.getService(serviceName).unlike(objectId, successCallback, errorCallback);
    },
    /**
     * This callback is displayed as part of the unlike method.
     * @callback SBW.Controllers.Services.ServiceController~unlike-successCallback
     * @param {Object} response JSON response from the service
     **/
    /**
     * This callback is displayed as part of the unlike method.
     * @callback SBW.Controllers.Services.ServiceController~unlike-errorCallback
     * @param {Object} response JSON response from the service
     **/
    /**
     * @method
     * @desc Posting comment on an object in the specified service.
     * @param {String} serviceName  Name of the registered service.
     * @param {Object} idObject  Id of the object liked i.e. post,comment etc..
     * @param {String} comment Comment to be posted on to the service.
     * @param {Function} successCallback  {@link SBW.Controllers.Services.ServiceController~postComment-successCallback Callback} to be executed on successful comment posting.
     * @param {Function} errorCallback  {@link SBW.Controllers.Services.ServiceController~postComment-errorCallback Callback} to be executed on comment posting error.
     */
    postComment: function (serviceArr, idObject, comment, successCallback, errorCallback) {
      if (!(serviceArr instanceof Array)) {
        SBW.Singletons.serviceFactory.getService(serviceArr).postComment(idObject, comment, successCallback, errorCallback);
      } else {
        serviceArr.forEach(function (serviceName, index, serviceArr) {
          SBW.Singletons.serviceFactory.getService(serviceName).postComment(idObject, comment, successCallback, errorCallback);
        });
      }
    },
    /**
     * This callback is displayed as part of the postComment method.
     * @callback SBW.Controllers.Services.ServiceController~postComment-successCallback
     * @param {Object} response JSON response from the service
     **/
    /**
     * This callback is displayed as part of the postComment method.
     * @callback SBW.Controllers.Services.ServiceController~postComment-errorCallback
     * @param {Object} response JSON response from the service
     **/
    /**
     * @method
     * @desc Retrieving posts from the specified service.
     * @param {String} serviceName  Name of the registered service.
     * @param {String} userId Id of the service user.
     * @param {Function} successCallback  {@link SBW.Controllers.Services.ServiceController~getPosts-successCallback Callback} to be executed on successful posts retrieving.
     * @param {Function} errorCallback  {@link SBW.Controllers.Services.ServiceController~getPosts-errorCallback Callback} to be executed on retrieving posts error.
     */
    getPosts: function (serviceName, userId, successCallback, errorCallback) {
      SBW.Singletons.serviceFactory.getService(serviceName).getPosts(userId, successCallback, errorCallback);
    },
    /**
     * This callback is displayed as part of the getPosts method.
     * @callback SBW.Controllers.Services.ServiceController~getPosts-successCallback
     * @param {Object} response JSON response from the service
     **/
    /**
     * This callback is displayed as part of the getPosts method.
     * @callback SBW.Controllers.Services.ServiceController~getPosts-errorCallback
     * @param {Object} response JSON response from the service
     **/
    /**
     * @method
     * @desc Retrieving likes of an object from the specified service.
     * @param {String} serviceName  Name of the registered service.
     * @param {String} objectId  Id of the object liked i.e. post,comment etc..
     * @param {Function} successCallback {@link SBW.Controllers.Services.ServiceController~getLikes-successCallback Callback} to be executed on successful likes retrieving.
     * @param {Function} errorCallback {@link SBW.Controllers.Services.ServiceController~getLikes-errorCallback Callback} to be executed on retrieving likes error.
     */
    getLikes: function (serviceName, objectId, successCallback, errorCallback) {
      SBW.Singletons.serviceFactory.getService(serviceName).getLikes(objectId, successCallback, errorCallback);
    },
    /**
     * This callback is displayed as part of the getLikes method.
     * @callback SBW.Controllers.Services.ServiceController~getLikes-successCallback
     * @param {Object} response JSON response from the service
     **/
    /**
     * This callback is displayed as part of the getLikes method.
     * @callback SBW.Controllers.Services.ServiceController~getLikes-errorCallback
		 * @param {Object} response JSON response from the service
		 **/
		/**
		 * @method
		 * @desc Deletes comments from the specified service that matches the object id.
		 * @param {String} serviceName  Name of the registered service.
		 * @param {String} objectId  Id of the object.
		 * @param {Function} successCallback  {@link SBW.Controllers.Services.ServiceController~deleteComment-successCallback Callback} to be executed on successful comments retrieving.
		 * @param {Function} errorCallback  {@link SBW.Controllers.Services.ServiceController~deleteComment-errorCallback Callback} to be executed on retrieving comments error.
		 */
		deleteComment: function(serviceName, objectId, successCallback, errorCallback) {
			SBW.Singletons.serviceFactory.getService(serviceName).deleteComment(objectId, successCallback, errorCallback);
		},
		/**
		 * This callback is displayed as part of the deleteComment method.
		 * @callback SBW.Controllers.Services.ServiceController~deleteComment-successCallback
		 * @param {Boolean} response JSON response from the service
		 **/
		/**
		 * This callback is displayed as part of the deleteComment method.
		 * @callback SBW.Controllers.Services.ServiceController~deleteComment-errorCallback
     * @param {Object} response JSON response from the service
     **/
    /**
     * @method
     * @desc Retrieving the comments from the specified service that matches the object id.
     * @param {String} serviceName  Name of the registered service.
     * @param {String} idObject  Id  object.
     * @param {Function} successCallback  {@link SBW.Controllers.Services.ServiceController~getComments-successCallback Callback} to be executed on successful comments retrieving.
     * @param {Function} errorCallback  {@link SBW.Controllers.Services.ServiceController~getComments-errorCallback Callback} to be executed on retrieving comments error.
     */
    getComments: function (serviceName, idObject, successCallback, errorCallback) {
      SBW.Singletons.serviceFactory.getService(serviceName).getComments(idObject, successCallback, errorCallback);
    },
    /**
     * This callback is displayed as part of the getComments method.
     * @callback SBW.Controllers.Services.ServiceController~getComments-successCallback
     * @param {SBW.Models.Comment} response JSON response from the service
     **/
    /**
     * This callback is displayed as part of the getComments method.
     * @callback SBW.Controllers.Services.ServiceController~getComments-errorCallback
     * @param {Object} response JSON response from the service
     **/
    /**
     * @method
     * @desc get albums for the logged in user from the specified service.
     * @param {String} serviceName  Name of the registered service.
     * @param {Function} successCallback  {@link SBW.Controllers.Services.ServiceController~getAlbums-successCallback Callback} to be executed on successful retrieval of albums.
     * @param {Function} errorCallback  {@link SBW.Controllers.Services.ServiceController~getAlbums-errorCallback Callback} to be executed on error while retrieving albums.
     */
    getAlbums: function (serviceName, successCallback, errorCallback) {
      SBW.Singletons.serviceFactory.getService(serviceName).getAlbums(successCallback, errorCallback);
    },
    /**
     * This callback is displayed as part of the getAlbums method.
     * @callback SBW.Controllers.Services.ServiceController~getAlbums-successCallback
     * @param {Array} response Array of {@link SBW.Models.AssetCollection albums} from the service
     **/
    /**
     * This callback is displayed as part of the getAlbums method.
     * @callback SBW.Controllers.Services.ServiceController~getAlbums-errorCallback
     * @param {SBW.Models.Error} response JSON response from the service
     **/
    /**
     * @method
     * @desc get albums for the logged in user from the specified service.
     * @param {String} serviceName  Name of the registered service.
     * @param {Function} successCallback  {@link SBW.Controllers.Services.ServiceController~getPhotos-successCallback Callback} to be executed on successful retrieval of albums.
     * @param {Function} errorCallback  {@link SBW.Controllers.Services.ServiceController~getPhotos-errorCallback Callback} to be executed on error while retrieving albums.
     */
    getPhotos: function (serviceName, successCallback, errorCallback) {
      SBW.Singletons.serviceFactory.getService(serviceName).getPhotos(successCallback, errorCallback);
    },
    /**
     * This callback is displayed as part of the getAlbums method.
     * @callback SBW.Controllers.Services.ServiceController~getAlbums-successCallback
     * @param {Array} response
     **/
    /**
     * This callback is displayed as part of the getAlbums method.
     * @callback SBW.Controllers.Services.ServiceController~getAlbums-errorCallback
     * @param {SBW.Models.Error} response JSON response from the service
     **/
    /**
     * @method
     * @desc Fetch photo details from album for the specified service.
     * @param {String} serviceName  Name of the registered service.
     * @param {String}   albumId Album Id from which to fetch the photo details.
     * @param {Function} successCallback  {@link SBW.Controllers.Services.ServiceController~getPhotosFromAlbum-successCallback Callback} to be called with json response after fetching the photo details successfully.
     * @param {Function} errorCallback  {@link SBW.Controllers.Services.ServiceController~getPhotosFromAlbum-errorCallback Callback} to be called in case of error while fetching photo details.
     */
    getPhotosFromAlbum: function (serviceName, albumId, successCallback, errorCallback) {
      SBW.Singletons.serviceFactory.getService(serviceName).getPhotosFromAlbum(albumId, successCallback, errorCallback);
    },
    /**
     * This callback is displayed as part of the getPhotosFromAlbum method.
     * @callback SBW.Controllers.Services.ServiceController~getPhotosFromAlbum-successCallback
     * @param {Array} response Array of {@Link SBW.Models.Asset} from the service
     **/
    /**
     * This callback is displayed as part of the getPhotosFromAlbum method.
     * @callback SBW.Controllers.Services.ServiceController~getPhotosFromAlbum-errorCallback
     * @param {SBW.Models.Error} response JSON response from the service
     **/
    /**
     * @method
     * @desc Retrieves comments for the url with the specified options on the speicifed service.
     * @param  {String[]} serviceArr An array of registered services.
     * @param {Object} options The service options to retrieve the comments.
     * @param {Function} successCallback {@link SBW.Controllers.Services.ServiceController~getCommentsForUrl-successCallback Callback} to be executed on successful comments retrieving.
     * @param {Function} errorCallback  {@link SBW.Controllers.Services.ServiceController~getCommentsForUrl-errorCallback Callback} to be executed on retrieving comments error.
     * @example
     * Usage:
     *  SBW.api
     *        .getCommentsForUrl(['Facebook','Flickr'], { url: 'www.example.com',  limit: 10,  offset: 0},
     *           function(response) {
     *              // Success callback logic...
     *            }, function(response) {
     *              // Error callback logic...
     *            });
     */
    getCommentsForUrl: function (serviceArr, options, successCallback, errorCallback) {
      if (!(serviceArr instanceof Array)) {
        SBW.Singletons.serviceFactory.getService(serviceArr).getCommentsForUrl(options, successCallback, errorCallback);
      } else {
        serviceArr.forEach(function (data, index, serviceArr) {
          SBW.Singletons.serviceFactory.getService(data).getCommentsForUrl(options, successCallback, errorCallback);
        });
      }
    },
    /**
     * This callback is displayed as part of the getCommentsForUrl method.
     * @callback SBW.Controllers.Services.ServiceController~getCommentsForUrl-successCallback
     * @param {SBW.Models.Comment} response JSON response from the service
     **/
    /**
     * This callback is displayed as part of the getCommentsForUrl method.
     * @callback SBW.Controllers.Services.ServiceController~getCommentsForUrl-errorCallback
     * @param {SBW.Models.Error} response JSON response from the service
     **/
    /**
     * @method
     * @desc Follow a user(twitter)/company(linkedin).
     * @param {String} serviceName Name of the registered service.
     * @param {String} serviceOption screenName(twitter) / companyId(linkedin) to follow.
     * @param {Function} successCallback {@link SBW.Controllers.Services.ServiceController~follow-successCallback Callback} to be executed after following user/company successfully.
     * @param {Function} errorCallback  {@link SBW.Controllers.Services.ServiceController~follow-errorCallback Callback} to be executed on error while following.
     */
    follow: function (serviceName, serviceOption, successCallback, errorCallback) {
      var serviceFactory = SBW.Singletons.serviceFactory;
      /*TODO - Check for method implementation in service being called*/
      //if(serviceFactory.getService(value).hasOwnProperty('follow')) {
      serviceFactory.getService(serviceName).follow(serviceOption, successCallback, errorCallback);
      //}
    },
    /**
     * This callback is displayed as part of the follow method.
     * @callback SBW.Controllers.Services.ServiceController~follow-successCallback
     * @param {SBW.Object} response JSON response from the service
     **/
    /**
     * This callback is displayed as part of the follow method.
     * @callback SBW.Controllers.Services.ServiceController~follow-errorCallback
     * @param {SBW.Models.Error} response JSON response from the service
     **/
    /**
     * @method
     * @desc Retrieves follow count for the user from the service
     * @param {String} serviceName Name of the registered service.
     * @param {String} serviceOption screenName(twitter) / companyid(linkedin) to get follow count.
     * @param {Function} successCallback {@link SBW.Controllers.Services.ServiceController~getFollowCount-successCallback Callback} to be executed on successful retrieval of follow count.
     * @param {Function} errorCallback  {@link SBW.Controllers.Services.ServiceController~getFollowCount-errorCallback Callback} to be executed on error while retrieving follow count.
     */
    getFollowCount: function (serviceName, serviceOption, successCallback, errorCallback) {
      var serviceFactory = SBW.Singletons.serviceFactory;
      /*TODO - Check for method implementation in service being called*/
      //if(serviceFactory.getService(value).hasOwnProperty('getFollowCount')) {
      serviceFactory.getService(serviceName).getFollowCount(serviceOption, successCallback, errorCallback);
      //}
    },
    /**
     * This callback is displayed as part of the getFollowCount method.
     * @callback SBW.Controllers.Services.ServiceController~getFollowCount-successCallback
     * @param {SBW.Object} response JSON response from the service
     **/
    /**
     * This callback is displayed as part of the getFollowCount method.
     * @callback SBW.Controllers.Services.ServiceController~getFollowCount-errorCallback
     * @param {SBW.Models.Error} response JSON response from the service
     **/
    /**
     * @method
     * @desc Retrieves the events from the specified service that matches the user ID.
     * @param {String} serviceName  Name of the registered service.
     * @param {String} userId  Id of the user.
     * @param {Function} successCallback  {@link SBW.Controllers.Services.ServiceController~getEvents-successCallback Callback} to be executed on successful events retrieval.
     * @param {Function} errorCallback  {@link SBW.Controllers.Services.ServiceController~getEvents-errorCallback Callback} to be executed on events retrieving error.
     */
    getEvents: function (serviceName, userId, successCallback, errorCallback) {
      SBW.Singletons.serviceFactory.getService(serviceName).getEvents(userId, successCallback, errorCallback);
    },
    /**
     * This callback is displayed as part of the getEvents method.
     * @callback SBW.Controllers.Services.ServiceController~getEvents-successCallback
     * @param {Object} response JSON response from the service
     **/
    /**
     * This callback is displayed as part of the getEvents method.
     * @callback SBW.Controllers.Services.ServiceController~getEvents-errorCallback
     * @param {Object} response JSON response from the service
     **/
    /**
     * @method
     * @desc Retrieves the social groups from the specified service that matches the user ID.
     * @param {String} serviceName  Name of the registered service.
     * @param {String} userId  Id of the user.
     * @param {Function} successCallback  {@link SBW.Controllers.Services.ServiceController~getSocialGroups-successCallback Callback} to be executed on successful social groups retrieval.
     * @param {Function} errorCallback  {@link SBW.Controllers.Services.ServiceController~getSocialGroups-errorCallback Callback} to be executed on social groups retrieving error.
     */
    getSocialGroups: function (serviceName, userId, successCallback, errorCallback) {
      SBW.Singletons.serviceFactory.getService(serviceName).getSocialGroups(userId, successCallback, errorCallback);
    },
    /**
     * This callback is displayed as part of the getSocialGroups method.
     * @callback SBW.Controllers.Services.ServiceController~getSocialGroups-successCallback
     * @param {Object} response JSON response from the service
     **/
    /**
     * This callback is displayed as part of the getSocialGroups method.
     * @callback SBW.Controllers.Services.ServiceController~getSocialGroups-errorCallback
     * @param {Object} response JSON response from the service
     **/
    /**
     * @method
     * @desc Retrieves the share count from the specified service that matches the url.
     * @param {Array} serviceArr  Array of service names
     * @param {String} url
     * @param {Function} successCallback  {@link SBW.Controllers.Services.ServiceController~getShareCount-successCallback Callback} to be executed on successful social groups retrieval.
     * @param {Function} errorCallback  {@link SBW.Controllers.Services.ServiceController~getShareCount-errorCallback Callback} to be executed on social groups retrieving error.
     */
    getShareCount: function (serviceArr, url, successCallback, errorCallback) {
      if (!(serviceArr instanceof Array)) {
        SBW.Singletons.serviceFactory.getService(serviceArr).getShareCount(url, successCallback, errorCallback);
      } else {
        serviceArr.forEach(function (data, index, serviceArr) {
          SBW.Singletons.serviceFactory.getService(data).getShareCount(url, successCallback, errorCallback);
        });
      }
    },
    /**
     * This callback is displayed as part of the getShareCount method.
     * @callback SBW.Controllers.Services.ServiceController~getShareCount-successCallback
     * @param {Object} response JSON response from the service
     **/
    /**
     * This callback is displayed as part of the getShareCount method.
     * @callback SBW.Controllers.Services.ServiceController~getShareCount-errorCallback
     * @param {Object} response JSON response from the service
     **/
    /**
     * @method
     * @desc Retrieves the friends list from the specified service that matches the user ID.
     * @param {String} serviceName  Name of the registered service.
     * @param {String} userId  Id of the user.
     * @param {Function} successCallback  {@link SBW.Controllers.Services.ServiceController~getFriends-successCallback Callback} to be executed on successful friends list retrieval.
     * @param {Function} errorCallback  {@link SBW.Controllers.Services.ServiceController~getFriends-errorCallback Callback} to be executed on friends list retrieving error.
     */
    getFriends: function (serviceName, userId, successCallback, errorCallback) {
      SBW.Singletons.serviceFactory.getService(serviceName).getFriends(userId, successCallback, errorCallback);
    },
    /**
     * This callback is displayed as part of the getFriends method.
     * @callback SBW.Controllers.Services.ServiceController~getFriends-successCallback
     * @param {Object} response JSON response from the service
     **/
    /**
     * This callback is displayed as part of the getFriends method.
     * @callback SBW.Controllers.Services.ServiceController~getFriends-errorCallback
     * @param {Object} response JSON response from the service
     **/
    /**
     * @method
     * @desc Retrieves the profile picture from the specified service that matches the user ID.
     * @param {String} serviceName  Name of the registered service.
     * @param {String} userId  Id of the user.
     * @param {Function} successCallback  {@link SBW.Controllers.Services.ServiceController~getProfilePic-successCallback Callback} to be executed on successful profile picture retrieval.
     * @param {Function} errorCallback  {@link SBW.Controllers.Services.ServiceController~getProfilePic-errorCallback Callback} to be executed on profile picture retrieving error.
     */
    getProfilePic: function (serviceName, userId, successCallback, errorCallback) {
      SBW.Singletons.serviceFactory.getService(serviceName).getProfilePic(userId, successCallback, errorCallback);
    },
    /**
     * This callback is displayed as part of the getProfilePic method.
     * @callback SBW.Controllers.Services.ServiceController~getProfilePic-successCallback
     * @param {String} response Url for the user's profile pic
     **/
    /**
     * This callback is displayed as part of the getProfilePic method.
     * @callback SBW.Controllers.Services.ServiceController~getProfilePic-errorCallback
     * @param {String} response  error response from the service
     **/
    /**
     * @method
     * @desc Publishes the notes onto the specified services.
     * @param  {String[]} serviceArr An array of registered services.
     * @param {String} subject  Message subject to be published.
     * @param {String} message  Message to be published.
     * @param {Function} successCallback  {@link SBW.Controllers.Services.ServiceController~publishNotes-successCallback Callback} to be executed on successful notes publishing.
     * @param {Function} errorCallback  {@link SBW.Controllers.Services.ServiceController~publishNotes-errorCallback Callback} to be executed on publishing notes error.
     */
    publishNotes: function (serviceArr, subject, message, successCallback, errorCallback) {
      if (!(serviceArr instanceof Array)) {
        SBW.Singletons.serviceFactory.getService(serviceArr).publishNotes(subject, message, successCallback, errorCallback);
      } else {
        serviceArr.forEach(function (data, index, serviceArr) {
          SBW.Singletons.serviceFactory.getService(data).publishNotes(subject, message, successCallback, errorCallback);
        });
      }
    },
    /**
     * This callback is displayed as part of the publishNotes method.
     * @callback SBW.Controllers.Services.ServiceController~publishNotes-successCallback
     * @param {Object} response JSON response from the service
     **/
    /**
     * This callback is displayed as part of the publishNotes method.
     * @callback SBW.Controllers.Services.ServiceController~publishNotes-errorCallback
     * @param {Object} response JSON response from the service
     **/
    /**
     * @method
     * @desc Retrieves the notes from the specified service that matches the user ID.
     * @param {String} serviceName  Name of the registered service.
     * @param {userId} Id of the user in that service.
     * @param {Function} successCallback  {@link SBW.Controllers.Services.ServiceController~getNotes-successCallback Callback} to be executed on successful notes retrieving.
     * @param {Function} errorCallback  {@link SBW.Controllers.Services.ServiceController~getNotes-errorCallback Callback} to be executed on retrieving notes error.
     */
    getNotes: function (serviceName, userId, successCallback, errorCallback) {
      SBW.Singletons.serviceFactory.getService(serviceName).getNotes(userId, successCallback, errorCallback);
    },
    /**
     * This callback is displayed as part of the getNotes method.
     * @callback SBW.Controllers.Services.ServiceController~getNotes-successCallback
     * @param {Object} response JSON response from the service
     **/
    /**
     * This callback is displayed as part of the getNotes method.
     * @callback SBW.Controllers.Services.ServiceController~getNotes-errorCallback
     * @param {Object} response JSON response from the service
     **/
    /**
     * @method
     * @desc Returns the popup window parameters with the specified dimensions.
     * @param {Object} layout  Object that specifies the dimensions of popup window.
     * @return {String} params Popup window parameters.
     */
    getPopupWindowParams: function (layout) {
      var height = (layout.height == undefined) ? '250' : layout.height;
      var width = (layout.width == undefined) ? '500' : layout.width;
      var left = ($(window).width() - width) / 2;
      var top = ($(window).height() - height) / 2;
      var params = 'width=' + width;
      params += ', height=' + height;
      params += ', top=' + top + ', left=' + left;
      params += ', location=no';
      params += ', menubar=no';
      params += ', resizable=no';
      params += ', scrollbars=yes';
      params += ', status=no';
      params += ', toolbar=no';
      return params;
    },
    /**
     * @method
     * @desc Retrieves the cookie value that matches the token.
     * @param {String} token Name of the cookie.
     * @return {String} value Value of the cookie.
     */
    getCookie: function (token) {
      //retrieve the cookie from the document
      var cks = document.cookie.split(";");
      var val = null;
      for (var i = 0; i < cks.length; i++) {
        var ck = cks[i].split('=');
        if (ck[1] && $.trim(ck[0]) == token && $.trim(ck[1]).length > 0) {
          val = ck[1];
          break;
        }
      }
      return val;
    },
    /**
     * @method
     * @desc Retrieves the profile of user from the service.
     * @param {String} serviceName  Name of the registered service.
     * @param {String} userId  Id of the service user.
     * @param {Function} successCallback  {@link SBW.Controllers.Services.ServiceController~getProfile-successCallback Callback} to be executed on successful profile retrieving.
     * @param {Function} errorCallback  {@link SBW.Controllers.Services.ServiceController~getProfile-errorCallback Callback} to be executed on retrieving profile error.
     */
    getProfile: function (serviceName, userId, successCallback, errorCallback) {
      SBW.Singletons.serviceFactory.getService(serviceName).getProfile(userId, successCallback, errorCallback);
    },
    /**
     * This callback is displayed as part of the getProfile method.
     * @callback SBW.Controllers.Services.ServiceController~getProfile-successCallback
     * @param {Object} response JSON response from the service
     **/
    /**
     * This callback is displayed as part of the getProfile method.
     * @callback SBW.Controllers.Services.ServiceController~getProfile-errorCallback
     * @param {Object} response JSON response from the service
     **/
    /**
     * @method
     * @desc Creates a new cookie with the name and value.
     * @param {String} name Name of the cookie.
     * @param {String} value Value for the cookie.
     * @param {Number} [days] The number of days for the cookie to be alive.
     */
    createCookie: function (name, value, days) {
      var expires, domain = window.location.hostname.substr(window.location.hostname.indexOf("."));
      if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
      } else {
        expires = "";
      }
      document.cookie = name + "=" + value + expires + "; path=/" + "; domain=" + domain;
    },
    /**
     * @method
     * @desc Removes the existing cookie that matches by name.
     * @param {String} name Name of the cookie to be removed.
     */
    eraseCookie: function (name) {
      this.createCookie(name, "", -1);
    },
    /**
     * @method
     * @desc Uploads the video onto the specified services.
     * @param {String} serviceName  Name of the registered service.
     * @param {Array} fileData  Array of {@link  SBW.Models.UploadFileMetaData}
     * @param {Function} successCallback  {@link SBW.Controllers.Services.ServiceController~uploadVideo-successCallback Callback} to be executed on successful video upload.
     * @param {Function} errorCallback  {@link SBW.Controllers.Services.ServiceController~uploadVideo-errorCallback Callback} to be executed on video upload error.
     */
    uploadVideo: function (serviceArr, fileData, successCallback, errorCallback) {
      if (!(serviceArr instanceof Array)) {
        SBW.Singletons.serviceFactory.getService(serviceArr).uploadVideo(fileData, successCallback, errorCallback);
      } else {
        serviceArr.forEach(function (data, index, serviceArr) {
          SBW.Singletons.serviceFactory.getService(data).uploadVideo(fileData, successCallback, errorCallback);
        });
      }
    },
    /**
     * This callback is displayed as part of the uploadVideo method.
     * @callback SBW.Controllers.Services.ServiceController~uploadVideo-successCallback
     * @param {SBW.Models.UploadStatus} response Object containting information about the upload status
     **/
    /**
     * This callback is displayed as part of the uploadVideo method.
     * @callback SBW.Controllers.Services.ServiceController~uploadVideo-errorCallback
     * @param {Object} response JSON response from the service
     **/
    /**
     * @method
     * @desc Uploads the photo onto the specified services.
     * @param  {String[]} serviceArr An array of registered services.
     * @param {Array} fileData  Array of {@link  SBW.Models.UploadFileMetaData}
     * @param {Function} successCallback  {@link SBW.Controllers.Services.ServiceController~uploadPhoto-successCallback Callback} to be executed on successful photo upload.
     * @param {Function} errorCallback  {@link SBW.Controllers.Services.ServiceController~uploadPhoto-errorCallback Callback} to be executed on photo upload error.
     */
    uploadPhoto: function (serviceArr, fileData, successCallback, errorCallback) {
      if (!(serviceArr instanceof Array)) {
        SBW.Singletons.serviceFactory.getService(serviceArr).uploadPhoto(fileData, successCallback, errorCallback);
      } else {
        serviceArr.forEach(function (data, index, serviceArr) {
          SBW.Singletons.serviceFactory.getService(data).uploadPhoto(fileData, successCallback, errorCallback);
        });
      }
    },
    /**
     * This callback is displayed as part of the uploadPhoto method.
     * @callback SBW.Controllers.Services.ServiceController~uploadPhoto-successCallback
     * @param {Object} response JSON response from the service
     **/
    /**
     * This callback is displayed as part of the uploadPhoto method.
     * @callback SBW.Controllers.Services.ServiceController~uploadPhoto-errorCallback
     * @param {Object} response JSON response from the service
     **/
    /**
     * @method
     * @desc Retrieves the post from the specified service that matches the post ID.
     * @param {String} serviceName  Name of the registered service.
     * @param {String} postID Id of the post.
     * @param {Function} successCallback  Callback to be executed on successful post retrieving.
     * @param {Function} errorCallback  Callback to be executed on post retrieving error.
     */
    getPostByID: function (serviceName, postID, successCallback, errorCallback) {
      SBW.Singletons.serviceFactory.getService(serviceName).getPostByID(postID, successCallback, errorCallback);
    },
    /**
     * @method
     * @desc Retrieves the comment from the specified service that matches the comment ID.
     * @param {String} serviceName  Name of the registered service.
     * @param {String} postID Id of the post.
     * @param {Function} successCallback  Callback to be executed on successful comment retrieving.
     * @param {Function} errorCallback  Callback to be executed on comment retrieving error.
     */
    getCommentByID: function (serviceName, commentByID, successCallback, errorCallback) {
      SBW.Singletons.serviceFactory.getService(serviceName).getCommentByID(commentByID, successCallback, errorCallback);
    },
    /**
     * @method
     * @desc Upload the file onto the specified service.
     * @param {String} serviceName  Name of the registered service.
     * @param {Array} fileData  Array of {@link  SBW.Models.UploadFileMetaData}
     * @param {Object} options The service options to upload the file e.g url, upload type, dataType etc...
     * @param {Function} successCallback  Callback to be executed on successful file uploading.
     * @param {Function} errorCallback  Callback to be executed on file uploading error.
     * @ignore
     */
    fileUpload: function (serviceName, fileData, options, successCallback, errorCallback) {
      var i = 0,
        j = 0,
        processData = options.processData || false,
        queueLength, fileLength = fileData.length,
        returnValue = [],
        service = this;
      service.fileStatus[serviceName] = service.fileStatus[serviceName] || [];
      for (i = 0; i < fileLength; i = i + 1) {
        queueLength = i; //service.fileStatus[serviceName].length
        /*service.fileStatus[serviceName][queueLength] = {
         'file': fileData[i].file.name,
         'status': 'uploading'
         };*/
        var formData = new FormData();
        for (var key in fileData[i]) {
          if (fileData[i].hasOwnProperty(key)) {
            formData.append(key, fileData[i][key]);
          }
        }

        var scallback = (function (len) {
          return function (response) {
            j++;
            // service.fileStatus[serviceName][len].status = "Uploaded";
            returnValue[len] = response;
            if (j === fileLength) {
              service.postUpload(serviceName, returnValue, successCallback, errorCallback);
            }
          }
        })(queueLength);

        var fcallback = (function (len) {
          return function (data) {
            j++;
            // service.fileStatus[serviceName][len].status = "Upload Failed";
            returnValue[len] = data;
            if (j === fileLength) {
              service.postUpload(serviceName, returnValue, successCallback, errorCallback);
            }
          }
        })(queueLength);
        SBW.Singletons.utils.ajax({
          url: options.url,
          type: options.type,
          data: formData,
          dataType: options.dataType,
          processData: processData,
          contentType: false
        }, scallback, fcallback);

      }
    },
    /**
     * @method
     * @desc Fetches assets from the asset collection
     * @param {String} serviceName  Name of the registered service.
     * @param  {String} serviceName A name of registered services.
     * @param  {String} assetCollectionId Id of the assetcollection
     * @param  {String} assetId Id of the asset.
     *
     */
    getAsset: function (serviceName, assetCollectionId, assetId) {
      var assetArray = SBW.Singletons.serviceFactory.getService(serviceName) && SBW.Singletons.serviceFactory.getService(serviceName).content || [],
        assetObj;
      assetArray.forEach(function (value) {
        if (value.metadata.assetCollectionId === assetCollectionId) {
          value.assets.forEach(function (asset) {
            if (asset.metadata.assetId === assetId) {
              assetObj = asset;
            }
          });
        }
      });
      return assetObj;
    },

    /**
     * @method
     * @desc Logs user out of service.
     * @param {String} serviceName  Name of the registered service.
     * @param {Function} successCallback  Callback to be executed on successful logging out.
     * @param {Function} errorCallback  Callback to be executed on logging out error.
     */
    logout: function(serviceName,successCallback,errorCallback){
       SBW.Singletons.serviceFactory.getService(serviceName).logout(successCallback,errorCallback);
    },    
    /**
     * @method
     * @desc Upload the post onto the specified services
     * @param  {String[]} serviceArr An array of registered services.
     * @param  {Object} returnValue Object that holds the service response.
     * @param {Function} successCallback  Callback to be executed on successful post uploading.
     * @param {Function} errorCallback  Callback to be executed on post uploading error.
     * @example
     * Usage:
     *   SBW.api
     *        .postUpload(['Facebook','Twitter'], , function(response) {
		 *          // Success callback logic..
		 *    }, function(response) {
		 *        // Error callback logic...
		 *   );
		 */
    postUpload: function (serviceArr, returnValue, successCallback, errorCallback) {
      if (!(serviceArr instanceof Array)) {
        SBW.Singletons.serviceFactory.getService(serviceArr).postUpload(returnValue, successCallback, errorCallback);
      } else {
        serviceArr.forEach(function (data, index, serviceArr) {
          SBW.Singletons.serviceFactory.getService(data).postUpload(returnValue, successCallback, errorCallback);
        });
      }
    },    
    /**
     * @method
     * @desc uploads raw image
     * @param {String[]} serviceArr An array of registered services.
     * @param {Array} mediaData array of image meta data objects
     * @param {Function} successCallback  Callback to be executed on successful logging out.
     * @param {Function} errorCallback  Callback to be executed on logging out error.
     */
    uploadRawImage: function(serviceArr, mediaData, successCallback,errorCallback){
       if (!(serviceArr instanceof Array)) {
        SBW.Singletons.serviceFactory.getService(serviceArr).uploadRawImage(mediaData, successCallback, errorCallback);
      } else {
        serviceArr.forEach(function (data, index, serviceArr) {  
            SBW.Singletons.serviceFactory.getService(data).uploadRawImage(mediaData, successCallback,errorCallback);
        });
      }
    }   

  });
}());
// End of IIFE
;
/**
 * @class
 * @name Facebook
 * @namespace SBW.Controllers.Services.Facebook
 * @classdesc This is Facebook service implementation
 * @augments ServiceController
 * @constructor
 */

SBW.Controllers.Services.Facebook = SBW.Controllers.Services.ServiceController.extend( /** @lends SBW.Controllers.Services.Facebook# */ {
  /**
   * @constant
   * @type {String}
   * @desc The service name
   **/
  name: 'facebook',
  /**
   * @property {Array} content {@link SBW.Models.AssetCollection Asset Collections} container for Facebook.
   */
  content: [],
  /**
   * @constant
   * @desc The icon class
   * @type {String}
   **/
  icon: 'facebook',
  /**
   * @constant
   * @desc The title of the service
   * @type {String}
   **/
  title: 'Facebook',
  /**
   * @constant
   * @desc Boolean to specify the initialization of facebook
   * @type {boolean}
   **/
  facebookInit: false,
  /**
   * @constant
   * @desc Facebook API URL
   * @type {String}
   **/
  apiUrl: 'https://graph.facebook.com',
  /**
   * @constant
   * @desc Supported File format for uploading to service
   * @type {Object}
   **/
  allowedExtensions: {
    'photo': /GIF|JPG|PNG|PSD|TIFF|JP2|IFF|WBMP|XBM/i,
    'video': /3g2|3gp|3gpp|asf|avi|dat|divx|dv|f4v|flv|m2ts|m4v|mkv|mod|mov|mp4|mpe|mpeg|mpeg4|mpg|mts|nsv|ogm|ogv|qt|tod|ts|vob|wmv/i
  },
  /**
   * @method
   * @desc Initialize method to setup require items
   **/
  init: function() {
    this.accessObject = {
      appId: SBW.Singletons.config.services.Facebook.appID,
      token: null
    };
    this.setup();
  },
  /**
   * @method
   * @desc This method is called at the time of setting the service
   */
  setup: function() {
    var self = this;
    $(document).ready(function() {
      var scriptEle = document.createElement('script'),
        done = false;
      if (document.getElementById('fb-root') === null) {
        var fbroot = document.createElement('script'),
          fbattr = document.createAttribute('id'),
          body = document.getElementsByTagName("body")[0] || document.documentElement;
        fbattr.value = 'fb-root';
        fbroot.setAttributeNode(fbattr);
        body.insertBefore(fbroot, body.lastChild);
      }
      scriptEle.src = "//connect.facebook.net/en_US/all.js";
      scriptEle.onload = scriptEle.onreadystatechange = function() {
        if (!done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
          done = true;
          FB.init({
            appId: self.accessObject.appId,
            xfbml: true,
            status: true,
            cookie: true
          });
          //TODO Hack for IE remove this when its fixed in facebook for IE http://bugs.developers.facebook.net/show_bug.cgi?id=20168
          if (navigator.userAgent.indexOf('MSIE') !== -1) {
            FB.UIServer.setLoadedNode = function(a, b) {
              FB.UIServer._loadedNodes[a.id] = b;
            };
          }
          // Handle memory leak in IE
          scriptEle.onload = scriptEle.onreadystatechange = null;
          self.facebookInit = true;
        }
      };
      var head = document.getElementsByTagName("head")[0] || document.documentElement;
      head.insertBefore(scriptEle, head.firstChild);
    });
  },
  /**
   * @method
   * @desc Triggers authentication process to the facebook service using FB.api call to method permissions.request. Disables start button.
   * @param {Callback} callback Callback will be executed on successful authentication
   */
  startActionHandler: function(callback) {
    var service = this;
    if (service.facebookInit) {
      FB.getLoginStatus(function(response) {
        service.user = service.user || new SBW.Models.User();
        if (response.status === 'connected') {
          // the user is logged in and connected to your
          // app, and response.authResponse supplies
          // the user's ID, a valid access token, a signed
          // request, and the time the access token
          // and signed request each expire
          service.getAccessToken.call(service, response, function(response) {
            service.user.name = response.name;
            service.user.id = response.id;
            service.getProfilePic(null, function(response) {
              service.user.userImage = response;
            }, function (error) {
              SBW.logger.debug("Could not fetch image url");
            });
            callback();
          });
        } else {
          window._facebookopen = window.open;
          window.open = function (url, name, params) {
            service.authWindowReference = window._facebookopen(url, name, params);
            return service.authWindowReference;
          };

          // the user isn't even logged in to Facebook.
          FB.login(function (response) {
            if (response.authResponse !== null && !$.isEmptyObject(response.authResponse)) {
              service.getAccessToken.call(service, response, function (response) {
                service.user.name = response.name;
                service.user.id = response.id;
                service.getProfilePic(null, function (response) {
                  service.user.userImage = response;
                }, function(error) {
                  SBW.logger.debug("Could not fetch image url");
                });
                callback();
              });
            } else {

              service.isUserLoggingIn = false;
              service.authWindowReference.close();
            }
          }, {
            scope: 'user_photos,user_videos,publish_stream,read_stream,publish_actions,user_events,create_event,user_groups,user_notes'
          });

          window.open = window._facebookopen;
          window._facebookopen = null;

          var intervalId = setInterval(function() {
            if (service.authWindowReference.closed) {
              service.isUserLoggingIn = false;
              clearInterval(intervalId);
            }
          }, 1000);
        }
      });
    } else {
      setTimeout(function() {
        service.startActionHandler();
      }, 1000);
    }
  },
  /**
   * @method
   * @desc Checks whether user is logged in(has a authenticated session to service).
   * @param {Callback} callback Callback function that will be called after checking login status
   */
  checkUserLoggedIn: function (callback) {
    var service = this;
    if (service.facebookInit) {
      FB.api('/me?access_token=' + service.accessObject['token'], function(response) {
        if (response.name !== undefined || response.error === null) {
          callback(true);
        } else {
          callback(false);
        }
      });
    } else {
      setTimeout(function() {
        service.checkUserLoggedIn(callback);
      }, 1000);
    }
  },
  /**
   * @method
   * @desc Retrieves access tokens from the response, sends request to facebook service to fetch user details using FB method me and call successLoginHandler on successful response.
   * @param {Object} response  response from facebook api for the method permissions.request(authentication)
   * @param {Callback} callback function to be called after fetching access token
   */
  getAccessToken: function(response, callback) {
    var service = this;
    if (response.status === "connected") {
      service.accessObject['uid'] = response.authResponse.userID;
      service.accessObject['token'] = response.authResponse.accessToken;
      service.accessObject['tokenSecret'] = response.authResponse.signedRequest;
      FB.api('/me?access_token=' + service.accessObject['token'], function(response) {
        if (response.name) {
          callback(response);
          if (service.authWindowReference && !service.authWindowReference.closed) {
            service.authWindowReference.close();
          }
        } else {
          service.failureLoginHandler.call(service, callback);
        }
      });
    } else {
      service.failureLoginHandler.call(service, callback);
    }
  },
  /**
   * @method
   * @desc Posts a message to facebook through FB API service
   * @param {String} message Message to be published
   * @param {Callback} successCallback {@link  SBW.Controllers.Services.ServiceController~publishMessage-successCallback Callback} will be called if publishing is successful
   * @param {Callback} errorCallback {@link  SBW.Controllers.Services.ServiceController~publishMessage-errorCallback Callback} will be called in case of any error while publishing
   */
  publishMessage: function(message, successCallback, errorCallback) {
    var service = this,
      publish = function(message, successCallback, errorCallback) {
        FB.api('/me/feed?access_token=' + service.accessObject['token'], 'post', {
          message: message
        }, function(response) {
          if (response.id !== undefined || response.error === null) {
            if (successCallback) {
              successCallback({
                id: response.id,
                serviceName: "facebook"
              }, response);
            }
          } else {
            if (errorCallback) {
              var errorObject = new SBW.Models.Error({
                message: response.error.message,
                code: response.error.code,
                serviceName: 'facebook',
                rawData: response
              });
              errorCallback(errorObject);
            }
          }
        })
      },
      callback = (function(message, successCallback, errorCallback) {
        return function() {
            publish(message, successCallback, errorCallback);
        };
      })(message, successCallback, errorCallback);

    service.startActionHandler(callback);
  },
  /**
   * @method
   * @desc Posts a message to facebook through FB API service
   * @param {Object} postObject object containing the metaData to Post a message
   * @example for the postObject
      {
        message: 'A Message'
        picture: 'http://www.socialbyway.com/style/images/logo.png',
        link :'http://www.socialbyway.com/',
        name:'A dummy Post',
        caption:'A simple caption for the post',
        description:'A dummy description for a dummy post',
        actions: {"name": "View on SBW", "link": "http://www.socialbyway.com/"}
      }
   * @param {Callback} successCallback {@link  SBW.Controllers.Services.ServiceController~postShare-successCallback Callback} will be called if publishing is successful
   * @param {Callback} errorCallback {@link  SBW.Controllers.Services.ServiceController~postShare-errorCallback Callback} will be called in case of any error while publishing
   */
  postShare: function(postObject, successCallback, errorCallback) {
    var service = this,
      publish = function(postObject, successCallback, errorCallback) {
        FB.api('/me/feed?access_token=' + service.accessObject['token'], 'post', {
          message: postObject.message || null,
          picture: postObject.picture || null,
          link: postObject.link || null,
          name: postObject.name || null,
          caption: postObject.caption || null,
          description: postObject.description || null,
          actions: (postObject.actions.name && postObject.actions.link) ? {
            name: postObject.actions.name,
            link: postObject.actions.link
          } : null
        }, function(response) {
          if (response.id !== undefined || response.error === null) {
            if (successCallback) {
              successCallback({
                id: response.id,
                serviceName: "facebook"
              }, response);
            }
          } else {
            if (errorCallback) {
              var errorObject = new SBW.Models.Error({
                message: response.error.message,
                code: response.error.code,
                serviceName: 'facebook',
                rawData: response
              });
              errorCallback(errorObject);
            }
          }
        })
      },
      callback = (function(postObject, successCallback, errorCallback) {
        return function(isLoggedIn) {
          if (isLoggedIn) {
            publish(postObject, successCallback, errorCallback);
          } else {
            service.startActionHandler(function() {
              publish(postObject, successCallback, errorCallback);
            });
          }
        };
      })(postObject, successCallback, errorCallback);

    service.checkUserLoggedIn(callback);
  },
  /**
   * @method
   * @desc Subscribes to a post on the facebook Service.
   * @param  {String}  uid             id of the post
   * @param {Callback} successCallback {@link  SBW.Controllers.Services.ServiceController~subscribe-successCallback Callback} will be called if successfully subscribes
   * @param {Callback} errorCallback {@link  SBW.Controllers.Services.ServiceController~subscribe-errorCallback Callback} will be called in case of any error
   */
  subscribe: function(uid, successCallback, errorCallback) {
    var service = this,
      publish = function(uid, successCallback, errorCallback) {
        FB.api('/me/og.follows?access_token=' + service.accessObject['token'], 'post', {
          profile: uid
        }, function(response) {
          if (response.name !== undefined || response.error === null) {
            if (successCallback) {
              successCallback(response);
            }
          } else {
            if (errorCallback) {
              var errorObject = new SBW.Models.Error({
                message: response.error.message,
                code: response.error.code,
                serviceName: 'facebook',
                rawData: response
              });
              errorCallback(errorObject);
            }

          }
        });
      },
      callback = (function(uid, successCallback, errorCallback) {
        return function(isLoggedIn) {
          if (isLoggedIn) {
            publish(uid, successCallback, errorCallback);
          } else {
            service.startActionHandler(function() {
              publish(uid, successCallback, errorCallback);
            });
          }
        };
      })(uid, successCallback, errorCallback);

    service.checkUserLoggedIn(callback);
  },
  /**
   * @method
   * @desc Shares the link to the wall of the user through FB API Service.
   * @param  {String} link url of the link to be shared.
   * @param  {Callback} successCallback {@link  SBW.Controllers.Services.ServiceController~share-successCallback Callback} will be called if successfully shared the link.
   * @param  {Callback} errorCallback {@link  SBW.Controllers.Services.ServiceController~share-errorCallback Callback} will be called if case of any error in sharing the link.
   */
  share: function(link, successCallback, errorCallback) {
    var service = this,
      publish = function(link, successCallback, errorCallback) {
        FB.api('/me/feed?access_token=' + service.accessObject['token'], 'post', {
          link: link
        }, function(response) {
          if (response.name !== undefined || response.error === null) {
            if (successCallback) {
              successCallback(response);
            }
          } else {
            if (errorCallback) {
              var errorObject = new SBW.Models.Error({
                message: response.error.message,
                code: response.error.code,
                serviceName: 'facebook',
                rawData: response
              });
              errorCallback(errorObject);
            }

          }
        });
      },
      callback = (function(message, successCallback, errorCallback) {
        return function() {
            publish(message, successCallback, errorCallback);
        };
      })(link, successCallback, errorCallback);

    service.startActionHandler(callback);
  },
  /**
   * @method
   * @desc Publishes link onto the wall of the user.
   * @param {String} type  A string indicating the type for this post (including link, photo, video)
   * @param {String} name  The name of the link
   * @param {String} caption  The caption of the link (appears beneath the link name)
   * @param {String} message  message relate to link
   * @param {String} link  The link attached to this post
   * @param {String} description  description of the link (appears beneath the link caption)
   * @param {String} picture  If available, a link to the picture included with this post
   * @param {String} icon  A link to an icon representing the type of this post
   * @param {Callback} successCallback {@link  SBW.Controllers.Services.ServiceController~publishLink-successCallback Callback} will get called if publish successful
   * @param {Callback} errorCallback {@link  SBW.Controllers.Services.ServiceController~publishLink-errorCallback Callback} will get called in case of any error
   */
  publishLink: function(type, name, caption, message, link, description, picture, icon, successCallback, errorCallback) {
    var service = this,
      linkJson = {
        type: type,
        name: name,
        caption: caption,
        message: message,
        link: link,
        description: description,
        picture: picture,
        icon: icon
      },
      publish = function(obj, successCallback, errorCallback) {
        FB.api('/me/feed?access_token=' + service.accessObject['token'], 'post', {
          type: obj.type,
          name: obj.name,
          message: obj.message,
          caption: obj.caption,
          link: obj.link,
          description: obj.description,
          picture: obj.picture,
          icon: obj.icon
        }, function(response) {
          if (response.name !== undefined || response.error === null) {
            if (successCallback) {
              successCallback(response); //make the response consistent with other services
            }
          } else {
            if (errorCallback) {
              var errorObject = new SBW.Models.Error({
                message: response.error.message,
                code: response.error.code,
                serviceName: 'facebook',
                rawData: response
              });
              errorCallback(errorObject);
            }
          }
        });
      },
      callback = (function(linkJson, successCallback, errorCallback) {
        return function(isLoggedIn) {
          if (isLoggedIn) {
            publish(linkJson, successCallback, errorCallback);
          } else {
            service.startActionHandler(function() {
              publish(linkJson, successCallback, errorCallback);
            });
          }
        };
      })(linkJson, successCallback, errorCallback);

    service.checkUserLoggedIn(callback);
  },
  /**
   * @method
   * @desc Posts an event to facebook through FB API service
   * @param {String} name Name of the event
   * @param {Date} startTime Start time of the event
   * @param {Date} endTime End time of the event
   * @param {Callback} successCallback {@link  SBW.Controllers.Services.ServiceController~publishEvent-successCallback Callback} will be called if publishing is successful
   * @param {Callback} errorCallback {@link  SBW.Controllers.Services.ServiceController~publishEvent-errorCallback Callback} will be called in case of any error while publishing
   */
  publishEvent: function(name, startTime, endTime, successCallback, errorCallback) {
    var service = this,
      publish = function(name, startTime, endTime, successCallback, errorCallback) {
        FB.api('/me/events?access_token=' + service.accessObject['token'], 'post', {
          name: name,
          start_time: startTime,
          end_time: endTime
        }, function(response) {
          if (!response.id || !response.error) {
            if (successCallback) {
              successCallback(response);
            }
          } else {
            if (errorCallback) {
              var errorObject = new SBW.Models.Error({
                message: response.error.message,
                code: response.error.code,
                serviceName: 'facebook',
                rawData: response
              });
              errorCallback(errorObject);
            }

          }
        });
      },
      callback = (function(name, startTime, endTime, successCallback, errorCallback) {
        return function(isLoggedIn) {
          if (isLoggedIn) {
            publish(name, startTime, endTime, successCallback, errorCallback);
          } else {
            service.startActionHandler(function() {
              publish(name, startTime, endTime, successCallback, errorCallback);
            });
          }
        };
      })(name, startTime, endTime, successCallback, errorCallback);

    service.checkUserLoggeIdn(callback);
  },
  /**
   * @method
   * @desc Likes an object on facebook through FB API service
   * @param {String} objectId of the object to be liked.
   * @param {Callback} successCallback {@link  SBW.Controllers.Services.ServiceController~like-successCallback Callback} will be called if like is successful
   * @param {Callback} errorCallback {@link  SBW.Controllers.Services.ServiceController~like-errorCallback Callback} will be called in case of any error while liking
   */
  like: function(objectId, successCallback, errorCallback) {
    var service = this,
      postLike = function(objectId, successCallback, errorCallback) {
        FB.api('/' + objectId + '/likes?access_token=' + service.accessObject['token'], 'post', function(response) {
          if (response && !response.error) {
            if (successCallback) {
              successCallback(response);
            }
          } else {
            if (errorCallback) {
              var errorObject = new SBW.Models.Error({
                message: response.error.message,
                code: response.error.code,
                serviceName: 'facebook',
                rawData: response
              });
              errorCallback(errorObject);
            }
          }
        });
      },
      callback = (function(objectId, successCallback, errorCallback) {
        return function() {
            postLike(objectId, successCallback, errorCallback);
        };
      })(objectId, successCallback, errorCallback);

    service.startActionHandler(callback);
  },
  /**
   * @method
   * @desc Un likes an object on facebook through FB API service
   * @param {String} objectId of the object to be un liked.
   * @param {Callback} successCallback {@link  SBW.Controllers.Services.ServiceController~unlike-successCallback Callback} will be called if unlike is successful
   * @param {Callback} errorCallback {@link  SBW.Controllers.Services.ServiceController~unlike-errorCallback Callback} will be called in case of any error while un liking
   */
  unlike: function(objectId, successCallback, errorCallback) {
    var service = this,
      postUnlike = function(objectId, successCallback, errorCallback) {
        FB.api('/' + objectId + '/likes?access_token=' + service.accessObject['token'], 'delete', function(response) {
          if (response && !response.error) {
            if (successCallback) {
              successCallback(response);
            }
          } else {
            if (errorCallback) {
              var errorObject = new SBW.Models.Error({
                message: response.error.message,
                code: response.error.code,
                serviceName: 'facebook',
                rawData: response
              });
              errorCallback(errorObject);
            }
          }
        });
      },
      callback = (function(objectId, successCallback, errorCallback) {
        return function() {
            postUnlike(objectId, successCallback, errorCallback);
        };
      })(objectId, successCallback, errorCallback);

    service.startActionHandler(callback);
  },
  /**
   * @method
   * @desc Posts a comment to facebook through FB API service
   * @param {Object} idObject Contains Ids of assets.
   * @param {String} comment
   * @param {Callback} successCallback {@link  SBW.Controllers.Services.ServiceController~postComment-successCallback Callback} will be called if posting is successful
   * @param {Callback} errorCallback {@link  SBW.Controllers.Services.ServiceController~postComment-errorCallback Callback} will be called in case of any error while posting
   */
  postComment: function(idObject, comment, successCallback, errorCallback) {
    var service = this,
      publish = function(idObject, comment, successCallback, errorCallback) {
        FB.api('/' + idObject.assetId + '/comments?access_token=' + service.accessObject['token'], 'post', {
          message: comment
        }, function(response) {
          if (response.error) {
            if (errorCallback) {
              var errorObject = new SBW.Models.Error({
                message: response.error.message,
                code: response.error.code,
                serviceName: 'facebook',
                rawData: response
              });
              errorCallback(errorObject);
            }
          } else {
            if (successCallback) {
              successCallback(response);
            }


          }
        });
      },
      callback = (function(idObject, comment, successCallback, errorCallback) {
        return function(isLoggedIn) {
          if (isLoggedIn) {
            publish(idObject, comment, successCallback, errorCallback);
          } else {
            service.startActionHandler(function() {
              publish(idObject, comment, successCallback, errorCallback);
            });
          }
        };
      })(idObject, comment, successCallback, errorCallback);

    service.checkUserLoggedIn(callback);
  },
  /**
   * @method
   * @desc Help us fetch specific set of data
   * @ignore
   */
  _getData: function(context, callback) {
    var service = this,
      url = context.url,
      user;
    if (!url) {
      user = context.id ? context.id : 'me';
      if (context.type === 'posts') {
        url = '/' + user + '/feed?access_token=' + service.accessObject['token'];
      } else if (context.type === 'likes') {
        url = '/' + context.id + '/likes?access_token=' + service.accessObject['token'];
      } else if (context.type === 'comments') {
        url = '/' + context.id + '/comments?access_token=' + service.accessObject['token'];
      } else if (context.type === 'events') {
        url = '/' + user + '/events?access_token=' + service.accessObject['token'];
      } else if (context.type === 'friends') {
        url = '/' + user + '/friends?access_token=' + service.accessObject['token'];
      } else if (context.type === 'notes') {
        url = '/' + user + '/notes?access_token=' + service.accessObject['token'];
      } else if (context.type === 'groups') {
        url = '/' + user + '/groups?access_token=' + service.accessObject['token'];
      } else if (context.type === 'user') {
        url = '/' + user + '?access_token=' + service.accessObject['token'];
      } else if (context.type === 'post') {
          url = '/' + context.id + '?access_token=' + service.accessObject['token'];
      }
    }
    FB.api(url, 'get', function(response) {
      callback(response);
    });
  },
  /**
   * @method
   * @desc Helps us retrieve all data of a particular context
   * @ignore
   */
  _getAllData: function(context, successCallback, errorCallback) {
    var service = this,
      posts = [],
      callback = (function(successCallback, errorCallback) {
        return function(response) {
          if (response && !response.error) {
            // if data is not present in response than return the response as it is and let the implementor fetch whatever he is looking for
            if (!response.data) {
              successCallback(response);
              return; // simply return !!
            }

            for (var i = 0, len = response.data.length; i < len; i++) {
              if (!response.data[i].story) {
                posts.push(response.data[i]);
              }
            }
            if (response.paging && response.paging.next) {
              service._getData({
                url: response.paging.next
              }, callback);
            } else {
              successCallback(posts);
            }
          } else {
            var errorObject = new SBW.Models.Error({
              message: response.error.message,
              code: response.error.code,
              serviceName: 'facebook',
              rawData: response
            });
            errorCallback(errorObject);
          }
        };
      })(successCallback, errorCallback);
    service._getData(context, callback);
  },
  /**
   * @method
   * @desc Fetches posts from a facebook user through FB API service
   * @param userId Id of the User.
   * @param {Callback} successCallback {@link  SBW.Controllers.Services.ServiceController~getPosts-successCallback Callback} will be called if data is fetched successfully
   * @param {Callback} errorCallback {@link  SBW.Controllers.Services.ServiceController~getPosts-errorCallback Callback} will be called in case of any error while fetching data
   */
   getPosts: function(userId, successCallback, errorCallback) {
    var service = this,
      callback = (function(successCallback, errorCallback) {
        return function(isLoggedIn) {
          if (isLoggedIn) {
            service._getAllData({
              type: 'posts',
              id: userId
            }, successCallback, errorCallback);
          } else {
            service.startActionHandler(function() {
              service._getAllData({
                type: 'posts',
                id: userId
              }, successCallback, errorCallback);
            });
          }
        };
      })(successCallback, errorCallback);
    service.checkUserLoggedIn(callback);
  },
  /**
   * @method
   * @desc  Retrieves a particular activity based on id
   * @param activityID Id of the activity.
   * @param {Callback} successCallback {@link  SBW.Controllers.Services.ServiceController~getPostByID-successCallback Callback} will be called if data is fetched successfully
   * @param {Callback} errorCallback {@link  SBW.Controllers.Services.ServiceController~getPostByID-errorCallback Callback} will be called in case of any error while fetching data
   */
  getPostByID: function(activityID, successCallback, errorCallback) {
      var service = this,
          callback = (function(successCallback, errorCallback) {
              return function(isLoggedIn) {
                  if (isLoggedIn) {
                      service._getAllData({
                          type: 'post',
                          id: activityID
                      }, successCallback, errorCallback);
                  } else {
                      service.startActionHandler(function() {
                          service._getAllData({
                              type: 'post',
                              id: activityID
                          }, successCallback, errorCallback);
                      });
                  }
              };
          })(successCallback, errorCallback);
      service.checkUserLoggedIn(callback);
  },
  /**
   * @method
   * @desc Fetches "Like" objects for an object through FB API service
   * @param objectId
   * @param {Callback} successCallback {@link  SBW.Controllers.Services.ServiceController~getLikes-successCallback Callback} will be called if data is fetched successfully
   * @param {Callback} errorCallback {@link  SBW.Controllers.Services.ServiceController~getLikes-errorCallback Callback} will be called in case of any error while fetching data
   */
  getLikes: function (objectId, successCallback, errorCallback) {
    var service = this,
      likeSuccess = function (response) {
        var likesData = [];
        for (var i = 0; i < response.length; i++) {
          var user = new SBW.Models.User({
            name: response[i].name,
            id: response[i].id
          });
          likesData[i] = new SBW.Models.Like({
            user: user,
            rawData: response[i]
          });
        }
        var likesObject = {
          serviceName: 'facebook',
          rawData: response,
          likes: likesData,
          likeCount: likesData.length
        };
        // Todo Populating the asset object with the like and user objects
        successCallback(likesObject);
      },
    callback = (function (successCallback, errorCallback) {
      return function (isLoggedIn) {
        if (isLoggedIn) {
          service._getAllData({
            type: 'likes',
            id: objectId
          }, likeSuccess, errorCallback);
        } else {
          service.startActionHandler(function () {
            service._getAllData({
              type: 'likes',
              id: objectId
            }, likeSuccess, errorCallback);
          });
        }
      };
    })(successCallback, errorCallback);
    service.checkUserLoggedIn(callback);
  },
  /**
   * @method
   * @desc Fetchs share count for a url on facebook
   * @param  {String} url             of the domain.
   * @param  {Callback} successCallback {@link  SBW.Controllers.Services.ServiceController~getShareCount-successCallback Callback} will be called if the share count is fetched successfully.
   * @param  {Callback} errorCallback {@link  SBW.Controllers.Services.ServiceController~getShareCount-errorCallback Callback} will be called in case of any error while fetching.
   */
  getShareCount: function(url, successCallback, errorCallback) {
    var service = this,
      getCount = function(url, successCallback, errorCallback) {
        FB.api('fql', {
          q: "SELECT url, normalized_url, share_count, like_count, comment_count, total_count, commentsbox_count, comments_fbid, click_count FROM link_stat WHERE url = '" + url + "'"
        }, function(response) {
          if (response && !response.error) {
            if (successCallback) {
              successCallback({
                count: response.data[0].share_count || 0
              }, response);
            }
          } else {
            if (errorCallback) {
              var errorObject = new SBW.Models.Error({
                message: response.error.message,
                code: response.error.code,
                serviceName: 'facebook',
                rawData: response
              });
              errorCallback(errorObject);
            }

          }
        });
      };
    if (service.facebookInit) {
      getCount(url, successCallback, errorCallback);
    } else {
      setTimeout(function() {
        service.getShareCount(url, successCallback, errorCallback);
      }, 1000);
    }
  },
  /**
   * @ignore
   */
  _populateAlbumThumbnail: function(successCallback, errorCallback) {
    var service = this,
      getPhoto = function(successCallback, errorCallback) {
        var i = 0;
        service.content.forEach(function(value, index, a) {
          FB.api('/' + value.metadata.coverid + "?access_token=" + service.accessObject['token'], 'get', function(response) {
            i++;
            if (response && !response.error) {
              value.metadata.thumbnail = response.picture || '';
            }
            if (i === a.length) {
              successCallback(service.content);
            }
          })
        });
      },
      callback = (function(successCallback, errorCallback) {
        return function(isLoggedIn) {
          if (isLoggedIn) {
            getPhoto(successCallback, errorCallback);
          } else {
            service.startActionHandler(function() {
              getPhoto(successCallback, errorCallback);
            });
          }
        };
      })(successCallback, errorCallback);

    service.checkUserLoggedIn(callback);
  },
  /**
   * @method
   * @desc Fetches album details of the logged in user from Facebook through Facebook API service.
   * The method doesn't require any authentication.
   * @param {SBW.Controllers.Services.Facebook~getAlbums-successCallback} successCallback callback function to be called with the json response after successfully fetching the album details.
   * @param {SBW.Controllers.Services.Facebook~getAlbums-errorCallback} errorCallback callback function to be called in case of error while fetching the album details.
   */
  getAlbums: function(successCallback, errorCallback) {
    var service = this,
      getAlbumsCallback = function(successCallback, errorCallback) {
        if(service.content.length>0){
          successCallback(service.content)
        } else {
        FB.api('/me/albums?access_token=' + service.accessObject['token'], 'get', function(response) {
          if (response && !response.error) {
            var collection = null,
              comment = null;
            response.data.forEach(function(value) {
              collection = new SBW.Models.AssetCollection({
                title: value.name,
                createdTime: new Date().getTime(),
                status: null,
                serviceName: 'facebook',
                metadata: {
                  dateUpdated: new Date(value.updated_time).toDateString(),
                  dateUploaded: new Date(value.created_time).toDateString(),
                  numAssets: value.count,
                  comments: [],
                  coverid: value.cover_photo,
                  assetCollectionId: value.id,
                  commentCount: (value.comments && value.comments.data.length) || 0,
                  fileName: null,
                  description: value.description || '',
                  author: value.from.name
                }
              });
              value.comments && value.comments.data.forEach(function(value) {
                comment = new SBW.Models.Comment({
                  text: value.message,
                  createdTime: value.created_time,
                  fromUser: value.from.name,
                  likeCount: value.like_count,
                  userImage: '',
                  serviceName: 'facebook',
                  rawData: value
                });
                collection.metadata.comments.push(comment);
              });
              collection.id = collection.getID();
              service.content.push(collection);
              service.collectionSetRawData = response;
            });
            service._populateAlbumThumbnail(function(response) {
              successCallback(response);
            }, errorCallback);

          } else {
            if (errorCallback) {
              var errorObject = new SBW.Models.Error({
                message: response.error.message,
                code: response.error.code,
                serviceName: 'facebook',
                rawData: response
              });
              errorCallback(errorObject);
            }

          }

        });
        }
      },
      callback = (function(successCallback, errorCallback) {
        return function(isLoggedIn) {
          if (isLoggedIn) {
            getAlbumsCallback(successCallback, errorCallback);
          } else {
            service.startActionHandler(function() {
              getAlbumsCallback(successCallback, errorCallback);
            });
          }
        };
      })(successCallback, errorCallback);

    service.checkUserLoggedIn(callback);
  },
  /**
   * Success Callback for getAlbums method.
   * @callback SBW.Controllers.Services.Facebook~getAlbums-successCallback
   * @param {Object} response JSON response from the service
   **/
  /**
   * Error Callback for getAlbums method.
   * @callback SBW.Controllers.Services.Facebook~getAlbums-errorCallback
   * @param {Object} response JSON response from the service
   **/
  /**
   * @method
   * @desc Fetch photo details from album
   * @param {String}   albumId          Album Id from which to fetch the photo details.
   * @param {SBW.Controllers.Services.Facebook~getPhotosFromAlbum-successCallback} successCallback  callback function to be called with json response after fetching the photo details successfully.
   * @param {SBW.Controllers.Services.Facebook~getPhotosFromAlbum-errorCallback} errorCallback  callback function to be called in case of error while fetching photo details.
   */
  getPhotosFromAlbum: function(albumId, successCallback, errorCallback) {
    var service = this,
      getPhotosFromAlbumCallback = function(albumId, successCallback, errorCallback) {
        FB.api('/' + albumId + '/photos?access_token=' + service.accessObject['token'], 'get', function(response) {
          if (response && !response.error) {
            var photoArray = [];
            response.data.forEach(function(value) {
              var asset = new SBW.Models.ImageAsset({
                src: value.source,
                title: value.name,
                createdTime: value.created_time,
                rawData: value,
                serviceName: 'facebook',
                metadata: {
                  dateUpdated: new Date(value.updated_time).toDateString(),
                  dateUploaded: new Date(value.created_time).toDateString(),
                  size: null,
                  assetId: value.id,
                  assetCollectionId: value.albumId,
                  height: value.height,
                  comments: [],
                  width: value.width,
                  commentCount: value.comments && value.comments.data.length,
                  originalFormat: null,
                  version: null,
                  description: value.name,
                  author: value.from.name
                }
              });
              value.comments && value.comments.data.forEach(function(value) {
                comment = new SBW.Models.Comment({
                  text: value.message,
                  createdTime: value.created_time,
                  fromUser: value.from.name || 'unknownn',
                  likeCount: value.like_count,
                  userImage: null,
                  serviceName: 'facebook',
                  rawData: value
                });
                asset.metadata.comments.push(comment);
              });
              asset.id = asset.getID();
              photoArray.push(asset);
            });
            service._populateAssets(albumId, photoArray);
            successCallback(photoArray);
          } else {
            if (errorCallback) {
              var errorObject = new SBW.Models.Error({
                message: response.error.message,
                code: response.error.code,
                serviceName: 'facebook',
                rawData: response
              });
              errorCallback(errorObject);
            }

          }
        })
      },
      callback = (function(albumId, successCallback, errorCallback) {
        return function(isLoggedIn) {
          if (isLoggedIn) {
            getPhotosFromAlbumCallback(albumId, successCallback, errorCallback);
          } else {
            service.startActionHandler(function() {
              getPhotosFromAlbumCallback(albumId, successCallback, errorCallback);
            });
          }
        };
      })(albumId, successCallback, errorCallback);

    service.checkUserLoggedIn(callback);
  },
  /**
   * @method
   * @desc Populate assets into asset collections.
   * @param {String} assetCollectionId Id of the asset collection
   * @param {Array} assets Array of {@link SBW.Models.Asset Assets}
   * @ignore
   */
  _populateAssets: function(assetcollectionId, assets) {
    var service = this;
    service.content.forEach(function(value) {
      if (value.metadata.assetCollectionId === assetcollectionId) {
        value.assets = assets;
        return false;
      }
    });
  },
  /**
   * @method
   * @desc Deletes Comments for an object through FB API service
   * @param objectId
   * @param {Callback} successCallback {@link  SBW.Controllers.Services.ServiceController~deleteComment-successCallback Callback} will be called if data is fetched successfully
   * @param {Callback} errorCallback {@link  SBW.Controllers.Services.ServiceController~deleteComment-errorCallback Callback} will be called in case of any error while fetching data
   */
  deleteComment: function(objectId, successCallback, errorCallback) {
    var service = this,
      purgeComment = function(objectId, successCallback, errorCallback) {
        FB.api('/' + objectId, 'delete', function(response) {
          if (response.error) {
            var errorObject = new SBW.Models.Error({
              message: response.error.message,
              code: response.error.code,
              serviceName: 'facebook',
              rawData: response
            });
            errorCallback(errorObject);
          } else {
            successCallback(response);
          }
        });
      },
      callback = (function(objectId, successCallback, errorCallback) {
        return function(isLoggedIn) {
          if (isLoggedIn) {
            purgeComment(objectId, successCallback, errorCallback);
          } else {
            service.startActionHandler(function() {
              purgeComment(objectId, successCallback, errorCallback);
            });
          }
        };
      })(objectId, successCallback, errorCallback);

    service.checkUserLoggedIn(callback);

  },
  /**
   * @method
   * @desc Fetches Comments for an object through FB API service
   * @param {Object} idObject
   * @param {Callback} successCallback {@link  SBW.Controllers.Services.ServiceController~getComments-successCallback Callback} will be called if data is fetched successfully
   * @param {Callback} errorCallback {@link  SBW.Controllers.Services.ServiceController~getComments-errorCallback Callback} will be called in case of any error while fetching data
   */
  getComments: function(idObject, successCallback, errorCallback) {
    var service = this,
      callback = (function(successCallback, errorCallback) {
        return function(isLoggedIn) {
          var commentSuccess = function(result) {
            var commentsData = [];
            for (var i = 0; i < result.length; i++) {
              commentsData[i] = new SBW.Models.Comment({
                createdTime: result[i].created_time,
                fromUser: result[i].from.name,
                fromUserId : result[i].from.id,
                likeCount: result[i].like_count,
                text: result[i].message,
                rawData: result[i],
                serviceName: "facebook"
              });
            }
            successCallback(commentsData);
          };
          if (isLoggedIn) {
            service._getAllData({
              type: 'comments',
              id: idObject.assetId
            }, commentSuccess, errorCallback);
          } else {
            service.startActionHandler(function() {
              service._getAllData({
                type: 'comments',
                id: idObject.assetId
              }, commentSuccess, errorCallback);
            });
          }
        };
      })(successCallback, errorCallback);
    service.checkUserLoggedIn(callback);
  },
  /**
   * @method
   * @desc Fetches events of a facebook user through FB API service
   * @param userId
   * @param {Callback} successCallback {@link  SBW.Controllers.Services.ServiceController~getEvents-successCallback Callback} will be called if data is fetched successfully
   * @param {Callback} errorCallback {@link  SBW.Controllers.Services.ServiceController~getEvents-errorCallback Callback} will be called in case of any error while fetching data
   */
  getEvents: function(userId, successCallback, errorCallback) {
    var service = this,
      callback = (function(successCallback, errorCallback) {
        return function(isLoggedIn) {
          if (isLoggedIn) {
            service._getAllData({
              type: 'events',
              id: userId
            }, successCallback, errorCallback);
          } else {
            service.startActionHandler(function() {
              service._getAllData({
                type: 'events',
                id: userId
              }, successCallback, errorCallback);
            });
          }
        };
      })(successCallback, errorCallback);
    service.checkUserLoggedIn(callback);
  },
  /**
   * @method
   * @desc This method helps in getting the social groups a facebook user is associated with through FB API service
   * @param userId
   * @param {Callback} successCallback {@link  SBW.Controllers.Services.ServiceController~getSocialGroups-successCallback Callback} will be called if data is fetched successfully
   * @param {Callback} errorCallback {@link  SBW.Controllers.Services.ServiceController~getSocialGroups-errorCallback Callback} will be called in case of any error while fetching data
   */
  getSocialGroups: function(userId, successCallback, errorCallback) {
    var service = this,
      callback = (function(successCallback, errorCallback) {
        return function(isLoggedIn) {
          if (isLoggedIn) {
            service._getAllData({
              type: 'groups',
              id: userId
            }, successCallback, errorCallback);
          } else {
            service.startActionHandler(function() {
              service._getAllData({
                type: 'groups',
                id: userId
              }, successCallback, errorCallback);
            });
          }
        };
      })(successCallback, errorCallback);
    service.checkUserLoggedIn(callback);
  },
  /**
   * @method
   * @desc Fetches friends of a facebook user through FB API service
   * @param userId
   * @param {Callback} successCallback {@link  SBW.Controllers.Services.ServiceController~getFriends-successCallback Callback} will be called if data is fetched successfully
   * @param {Callback} errorCallback {@link  SBW.Controllers.Services.ServiceController~getFriends-errorCallback Callback} will be called in case of any error while fetching data
   */
  getFriends: function(userId, successCallback, errorCallback) {
    var service = this,
      callback = (function(successCallback, errorCallback) {
        return function(isLoggedIn) {
          if (isLoggedIn) {
            service._getAllData({
              type: 'friends',
              id: userId
            }, successCallback, errorCallback);
          } else {
            service.startActionHandler(function() {
              service._getAllData({
                type: 'friends',
                id: userId
              }, successCallback, errorCallback);
            });
          }
        };
      })(successCallback, errorCallback);
    service.checkUserLoggedIn(callback);
  },
  /**
   * @method
   * @desc Fetches profile picture of user in facebook through FB API service
   * @param userId
   * @param {Callback} successCallback {@link  SBW.Controllers.Services.ServiceController~getProfilePic-successCallback Callback} will be called if data is fetched successfully
   * @param {Callback} errorCallback {@link  SBW.Controllers.Services.ServiceController~getProfilePic-errorCallback Callback} will be called in case of any error while fetching data
   */
  getProfilePic: function(userId, successCallback, errorCallback) {
    userId = userId ? userId : 'me';
    var service = this,
      getPic = function(userId, successCallback, errorCallback) {
        FB.api('/' + userId + '/picture', 'get', function(response) {
          if (response && !response.error) {
            if (successCallback) {
              successCallback(response.data.url);
            }
          } else {
            if (errorCallback) {
              var errorObject = new SBW.Models.Error({
                message: response.error.message,
                code: response.error.code,
                serviceName: 'facebook',
                rawData: response
              });
              errorCallback(errorObject);
            }

          }
        });
      };

    getPic(userId, successCallback, errorCallback);
  },
  /**
   * @method
   * @desc Publishes notes to facebook through FB API service
   * @param {String} subject Subject of the notes
   * @param {String} message Content of the notes
   * @param {Callback} successCallback {@link  SBW.Controllers.Services.ServiceController~publishNotes-successCallback Callback} will be called if publishing is successful
   * @param {Callback} errorCallback {@link  SBW.Controllers.Services.ServiceController~publishNotes-errorCallback Callback} will be called in case of any error while publishing
   */
  publishNotes: function(subject, message, successCallback, errorCallback) {
    var service = this,
      publish = function(subject, message, successCallback, errorCallback) {
        FB.api('/me/notes?access_token=' + service.accessObject['token'], 'post', {
          message: message,
          subject: subject
        }, function(response) {
          if (response && !response.error) {
            if (successCallback) {
              successCallback(response);
            }
          } else {
            if (errorCallback) {
              var errorObject = new SBW.Models.Error({
                message: response.error.message,
                code: response.error.code,
                serviceName: 'facebook',
                rawData: response
              });
              errorCallback(errorObject);
            }

          }
        });
      },
      callback = (function(subject, message, successCallback, errorCallback) {
        return function(isLoggedIn) {
          if (isLoggedIn) {
            publish(subject, message, successCallback, errorCallback);
          } else {
            service.startActionHandler(function() {
              publish(subject, message, successCallback, errorCallback);
            });
          }
        };
      })(subject, message, successCallback, errorCallback);

    service.checkUserLoggedIn(callback);
  },
  /**
   * @method
   * @desc Fetches notes of a facebook user through FB API service
   * @param {String} userId
   * @param {Callback} successCallback {@link  SBW.Controllers.Services.ServiceController~getNotes-successCallback Callback} will be called if data is fetched successfully
   * @param {Callback} errorCallback {@link  SBW.Controllers.Services.ServiceController~getNotes-errorCallback Callback} will be called in case of any error while fetching data
   */
  getNotes: function(userId, successCallback, errorCallback) {
    var service = this,
      callback = (function(successCallback, errorCallback) {
        return function(isLoggedIn) {
          if (isLoggedIn) {
            service._getAllData({
              type: 'notes',
              id: userId
            }, successCallback, errorCallback);
          } else {
            service.startActionHandler(function() {
              service._getAllData({
                type: 'notes',
                id: userId
              }, successCallback, errorCallback);
            });
          }
        };
      })(successCallback, errorCallback);
    service.checkUserLoggedIn(callback);
  },
  /**
   * @method
   * @desc Fetches the profile of the user
   * @param  {String} userId          [description]
   * @param  {Callback} successCallback {@link  SBW.Controllers.Services.ServiceController~getProfile-successCallback Callback} will be called if the profile is fetched successfully.
   * @param  {Callback} errorCallback {@link  SBW.Controllers.Services.ServiceController~getProfile-errorCallback Callback} will be called in case of any error in fetching the profile.
   */
  getProfile: function(userId, successCallback, errorCallback) {
    var service = this,
      callback = (function(successCallback, errorCallback) {
        return function(isLoggedIn) {
          if (isLoggedIn) {
            service._getAllData({
              type: 'user',
              method: 'get',
              id: userId
            }, successCallback, errorCallback);
          } else {
            service.startActionHandler(function() {
              service._getAllData({
                type: 'user',
                method: 'get',
                id: userId
              }, successCallback, errorCallback);
            });
          }
        };
      })(successCallback, errorCallback);
    service.checkUserLoggedIn(callback);
  },
  /**
   * @method
   * @desc Uploads photos to facebook user acount by making an ajax call.
   * @param {Array} fileData  Array of {@link  SBW.Models.UploadFileMetaData}
   * @param {Callback} successCallback {@link  SBW.Controllers.Services.ServiceController~uploadPhoto-successCallback Callback} will be called if data is fetched successfully
   * @param {Callback} errorCallback {@link  SBW.Controllers.Services.ServiceController~uploadPhoto-errorCallback Callback} will be called in case of any error while fetching data
   */
  uploadPhoto: function(fileData, successCallback, errorCallback) {
    var url = this.apiUrl + '/me/photos';
    this._uploadMedia(fileData, successCallback, errorCallback, url);
  },
  /**
   * @method
   * @desc Uploads videos to facebook user acount by making an ajax call.
   * @param {Array} fileData  Array of {@link  SBW.Models.UploadFileMetaData}
   * @param {Callback} successCallback {@link  SBW.Controllers.Services.ServiceController~uploadVideo-successCallback Callback} will be called if data is fetched successfully
   * @param {Callback} errorCallback {@link  SBW.Controllers.Services.ServiceController~uploadVideo-errorCallback Callback} will be called in case of any error while fetching data
   */
  uploadVideo: function(fileData, successCallback, errorCallback) {
    var url = 'https://graph-video.facebook.com/me/videos';
    this._uploadMedia(fileData, successCallback, errorCallback, url);
  },
  /**
   * @method
   * @desc Utility for upload media
   * @ignore
   */
  _uploadMedia: function(fileData, successCallback, errorCallback, context) {
    var service = this,
      upload = function(fileData, successCallback, errorCallback, context) {
        var url = context + '?access_token=' + service.accessObject['token'];
        var options = {
          url: url,
          type: 'POST',
          dataType: 'json',
          contentType: false
        };
        SBW.api.fileUpload('facebook', fileData, options, successCallback, errorCallback);
      },
      callback = (function(fileData, successCallback, errorCallback, context) {
        return function(isLoggedIn) {
          if (isLoggedIn) {
            upload(fileData, successCallback, errorCallback, context);
          } else {
            service.startActionHandler(function() {
              upload(fileData, successCallback, errorCallback, context);
            });
          }
        };
      })(fileData, successCallback, errorCallback, context);

    service.checkUserLoggedIn(callback);
  },
  /**
   * @method
   * @desc postupload function is used to make consistent response for uploads across different services
   * @param  {Object} response        contains facebook sent response for uploaded file
   * @param  {Callback} successCallback Callaback will be called once the success event happens
   * @param  {Callback} errorCallback Callback will be called once the failure event happens
   */
  postUpload: function(response, successCallback, errorCallback) {
    var uploadStatus = [],
      callBack = successCallback;
    response.forEach(function(value) {
      if (value && !value.error) {
        uploadStatus.push(new SBW.Models.UploadStatus({
          id: value.id,
          postId: value.post_id,
          serviceName: 'facebook',
          status: 'success',
          rawData: value
        }));
      } else {
        callBack = errorCallback;
        uploadStatus.push(new SBW.Models.Error({
          message: value.error.message,
          code: value.error.code,
          serviceName: 'facebook',
          rawData: value
        }));
      }
    });

    callBack(uploadStatus);
  },
  /**
   * @method
   * @desc publishPhoto method uploads photo to facebook user account with FB API service
   * @param  {String} description     description about the photo
   * @param  {String} imageUrl        url pointing to the image
   * @param {Callback} successCallback  {@link  SBW.Controllers.Services.ServiceController~publishPhoto-successCallback Callback} will be called if data is fetched successfully
   * @param {Callback} errorCallback  {@link  SBW.Controllers.Services.ServiceController~publishPhoto-errorCallback Callback} will be called in case of any error while fetching data
   * @ignore
   */
  publishPhoto: function(description, imageUrl, successCallback, errorCallback) {
    var service = this,
      publish = function(description, imageUrl, successCallback, errorCallback) {
        FB.api('/me/photos?access_token=' + service.accessObject['token'], 'post', {
          url: imageUrl,
          message: description
        }, function(response) {
          if (response && !response.error) {
            if (successCallback) {
              successCallback(response);
            }
          } else {
            if (errorCallback) {
              var errorObject = new SBW.Models.Error({
                message: response.error.message,
                code: response.error.code,
                serviceName: 'facebook',
                rawData: response
              });
              errorCallback(errorObject);
            }

          }
        });
      },
      callback = (function(description, imageUrl, successCallback, errorCallback) {
        return function(isLoggedIn) {
          if (isLoggedIn) {
            publish(description, imageUrl, successCallback, errorCallback);
          } else {
            service.startActionHandler(function() {
              publish(description, imageUrl, successCallback, errorCallback);
            });
          }
        };
      })(description, imageUrl, successCallback, errorCallback);

    service.checkUserLoggedIn(callback);
  },
  /**
   * @method
   * @desc Logs user out of service.
   * @param {Function} successCallback  Callback to be executed on successful logging out.
   * @param {Function} errorCallback  Callback to be executed on logging out error.
   */
  logout: function(successCallback, errorCallback) {
    var service = this;
    service.accessObject.token = null;
    service.content = [];
    FB.logout(function(response) {
      if (response.error) {
        var errorObject = new SBW.Models.Error({
          message: response.error.message,
          code: response.error.code,
          serviceName: 'facebook',
          rawData: response
        });
        errorCallback(errorObject);
      } else {
        successCallback(response);
      }
    });
  },

    /**
     * @method
     * @desc uploads raw image     
     * @param {Array} mediaData array of image meta data objects
     * @param {Function} successCallback  Callback to be executed on successful logging out.
     * @param {Function} errorCallback  Callback to be executed on logging out error.
     */
    uploadRawImage: function (mediaData, successCallback, errorCallback) {
      var service = this,
        tempMedia = JSON.parse(JSON.stringify(mediaData));
      tempMedia.forEach(function (fileData) {
        var url = SBW.Singletons.config.proxyURL + "?url=" + fileData.file,
          sendRequest = function (response) {
            if(response.length) {
              var length = response.length,
                arrayBuffer = new ArrayBuffer(length),
                unit8Array = new Uint8Array(arrayBuffer);
              for (var i = 0; i < length; i++) {
                unit8Array[i] = response.charCodeAt(i);
              }
              fileData["file"] = new Blob([arrayBuffer], {"type": "image/jpeg"});
              service.uploadPhoto([fileData], successCallback, errorCallback);
            }else{
              errorCallback(response)
            }
          };
        SBW.Singletons.utils.getRawImage(url,sendRequest);
      });
    },

  /**
   * @method
   * @desc Fetches comments for a url on facebook
   * @param  {Object} options          containing url,limit and offset
   * @param  {Callback} successCallback  {@link  SBW.Controllers.Services.ServiceController~getCommentsForUrl-successCallback Callback} will be called if data is fetched successfully
   * @param  {Callback} errorCallback  {@link  SBW.Controllers.Services.ServiceController~getCommentsForUrl-errorCallback Callback} will be called in case of any error while fetching data
   */
  getCommentsForUrl: function(options, successCallback, errorCallback) {
    var service = this,
      success = function(response) {
        var data = [],
          i = 0;
        response.data.forEach(function(value, index, array) {
          service.getProfilePic(value['from']['id'], function(picResponse) {
            var temp = new SBW.Models.Comment({
              createdTime: value['created_time'],
              fromUser: value['from']['name'],
              likeCount: value['like_count'],
              text: value['message'],
              userImage: picResponse,
              rawData: value,
              serviceName: "facebook"
            });
            data[index] = (temp);
            i++;
            if (i === array.length) {
              successCallback(data);
            }
          }, function(picResponse) {
            var temp = new SBW.Models.Comment({
              createdTime: value['created_time'],
              fromUser: value['from']['name'],
              likeCount: value['like_count'],
              text: value['message'],
              rawData: value,
              serviceName: "facebook"
            });
            data[index] = (temp);
            i++;
            if (i === array.length) {
              successCallback(data);
            }
          });


        });

      },
      error = function(response) {
        var errorObject = new SBW.Models.Error({
          message: response.error.message,
          code: response.error.code,
          serviceName: 'facebook',
          rawData: response
        });
        errorCallback(errorObject);
      };
    SBW.Singletons.utils.ajax({
      url: service.apiUrl + '/comments/?id=' + options.url + '&limit=' + (options.limit || 10) + '&offset=' + (options.offset || 0),
      type: "GET",
      data: {},
      dataType: "json"
    }, success, error);
  }
});
/**
 * @class Flickr
 * @classdesc This is Flickr service implementation
 * @augments ServiceController
 * @constructor
 */

SBW.Controllers.Services.Flickr = SBW.Controllers.Services.ServiceController.extend(/** @lends SBW.Controllers.Services.Flickr# */ {
  /**
   * @constant
   * @type {string}
   * @desc The service name
   **/
  name: 'flickr',
  /**
   * @constant
   * @desc The icon class
   * @type {string}
   **/
  icon: 'flickr',
  /**
   * @constant
   * @desc The title of the service
   * @type {string}
   **/
  title: 'Flickr',
  /**
   * @property {Array} content {@link SBW.Models.AssetCollection Asset Collections} container for Flickr.
   */

  content: [],
  /**
   * @method
   * @desc initialize method to setup required items
   **/
  init: function () {
    this.callbackUrl = SBW.Singletons.utils.callbackURLForService('Flickr');
    this.proxyUrl = SBW.Singletons.config.proxyURL;
    this.requestTokenUrl = "http://www.flickr.com/services/oauth/request_token";
    this.authorizationUrl = "http://www.flickr.com/services/oauth/authorize";
    this.accessTokenUrl = "http://www.flickr.com/services/oauth/access_token";
    this.flickrApiUrl = "http://api.flickr.com/services/rest";
    this.flickrUploadApiUrl = "http://api.flickr.com/services/upload/";
    this.accessObject = {
      consumerKey: SBW.Singletons.config.services.Flickr.apiKey,
      consumerSecret: SBW.Singletons.config.services.Flickr.secret,
      access_token: null,
      id: null,
      permissionLevel: 'write'
    };
  },
  /**
   * @method
   * @triggers authentication process to the flickr service.
   * @param {callback} callback
   */
  startActionHandler: function (callback) {
    var service = this;
    service.eraseCookie('flickrToken');
    var tokenListener = function (windowReference) {
      if (!windowReference.closed) {
        if (service.getCookie('flickrToken')) {
          windowReference.close();
          service.getAccessToken.call(service, callback);
        } else {
          setTimeout(function () {
            tokenListener(windowReference);
          }, 2000);
        }
      } else {
        service.isUserLoggingIn = false;
      }
    };

    if (service.authWindowReference === undefined || service.authWindowReference === null || service.authWindowReference.closed) {
      service.authWindowReference = window.open('', 'Flickr' + new Date().getTime(), service.getPopupWindowParams({
        height: 500,
        width: 400
      }));
      service.authWindowReference.document.write("redirecting to Flickr");

      /*The reference window is bounded with beforeunload event to see if the popup is closed using the window close button*/
      $(service.authWindowReference).bind("beforeunload", function (e) {
        var _window = this;
        setTimeout(function () {
          if (_window.closed) {
            service.isUserLoggingIn = false;
          }
        }, 500);
      });

      var message = {
        action: service.requestTokenUrl,
        method: "GET",
        parameters: {
          oauth_callback: service.callbackUrl
        }
      };

      service.accessObject.access_token = null;
      service.accessObject.tokenSecret = null;
      var url = service.signAndReturnUrl(service.requestTokenUrl, message);
      $.ajax({
        url: service.proxyUrl,
        data: {
          url: url
        },
        type: 'GET',
        success: function (response) {
          var respJson = SBW.Singletons.utils.getJSONFromQueryParams(response);
          service.accessObject.access_token = respJson.oauth_token;
          service.accessObject.tokenSecret = respJson.oauth_token_secret;
          service.authWindowReference.document.location.href = service.authorizationUrl + "?oauth_token=" + service.accessObject.access_token + "&perms=write";
          tokenListener(service.authWindowReference);
        },
        error: function (response) {
        }
      });

    } else {
      service.authWindowReference.focus();
    }
  },
  /**
   * @method
   * @desc Method to check whether user is logged in(has an authenticated session to service).
   * @param {callback} callback Callback function that will be called after checking login status
   **/
  checkUserLoggedIn: function (callback) {
    var service = this;
    if (this.accessObject.access_token !== null && this.accessObject.access_token !== undefined && service.isUserLoggingIn) {
      callback(true);
    } else {
      callback(false);
    }
  },
  /**
   * @method
   * @desc Utility method used for signing urls.
   * @param {String} link url link to be signed
   * @param {Object} msg hash object used for signing the request.
   * @returns {String} url signed url
   **/
  signAndReturnUrl: function (link, msg) {
    var service = this;
    OAuth.completeRequest(msg, service.accessObject);
    OAuth.SignatureMethod.sign(msg, service.accessObject);
    link = link + '?' + OAuth.formEncode(msg.parameters);
    return link;
  },

  /**
   * @method
   * @desc uploads raw image
   * @param {Array} mediaData array of image meta data objects
   * @param {Function} successCallback  Callback to be executed on successful logging out.
   * @param {Function} errorCallback  Callback to be executed on logging out error.
   */
  uploadRawImage: function (mediaData, successCallback, errorCallback) {
    var service = this,
      tempMedia = JSON.parse(JSON.stringify(mediaData));
    tempMedia.forEach(function (fileData) {
      var url = service.proxyUrl + "?url=" + fileData.file,
        sendRequest = function (response) {
          if(response.length) {
            var length = response.length,
              arrayBuffer = new ArrayBuffer(length),
              unit8Array = new Uint8Array(arrayBuffer);
            for (var i = 0; i < length; i++) {
              unit8Array[i] = response.charCodeAt(i);
            }
            fileData["file"] = new Blob([arrayBuffer], {"type": "image/jpeg"});
            service.uploadPhoto([fileData], successCallback, errorCallback);
          }else{
            errorCallback(response)
          }
        };
      SBW.Singletons.utils.getRawImage(url,sendRequest);
    });
  },

  /**
   * @method
   * @desc Retrieves access tokens from the response, sends request to flickr service to fetch user details using Flickr method and call successLoginHandler on successful response.
   * @param callback callback function to be called after fetching access token
   */
  getAccessToken: function (callback) {
    var service = this,
      flickrVerifier = service.getCookie('flickrToken');
    if (flickrVerifier) {
      var message = {
          action: service.accessTokenUrl,
          method: "GET",
          parameters: {
            oauth_token: service.accessObject.access_token,
            oauth_verifier: flickrVerifier,
            perms: 'write'
          }
        },
        url = service.signAndReturnUrl(service.accessTokenUrl, message);
      $.ajax({
        url: service.proxyUrl,
        data: {
          url: url
        },
        type: 'GET',
        crossDomain: true,
        success: function (response) {
          var jsonResp = SBW.Singletons.utils.getJSONFromQueryParams(response);
          service.accessObject.id = decodeURIComponent(jsonResp.user_nsid);
          service.accessObject.access_token = jsonResp.oauth_token;
          service.accessObject.tokenSecret = jsonResp.oauth_token_secret;
          service.user = new SBW.Models.User({
            name: jsonResp.username,
            id: decodeURIComponent(jsonResp.user_nsid),
            userImage: 'http://flickr.com/buddyicons/' + decodeURIComponent(jsonResp.user_nsid) + '.jpg'
          });
          service.populateUserInformation.call(service, service.user);
          service.isUserLoggingIn = true;
          callback(response);
        }
      });
    } else {
      alert("error in getting access token");
    }
  },

  /**
   * @method
   * @desc  To like an object.
   * @param {String} objectId
   * @param {Callback} successCallback {@link  SBW.Controllers.Services.ServiceController~like-successCallback Callback} will be called if like is successful
   * @param {Callback} errorCallback {@link  SBW.Controllers.Services.ServiceController~like-errorCallback Callback} will be called in case of any error while liking
   */
  like: function (objectId, successCallback, errorCallback) {
    var service = this,
      postLike = function (objectId, successCallback, errorCallback) {
        var apiKey = service.accessObject.consumerKey,
          message = {
            action: service.flickrApiUrl,
            method: "POST",
            parameters: {
              method: 'flickr.favorites.add',
              perms: 'write',
              format: 'json',
              photo_id: objectId,
              api_key: apiKey,
              nojsoncallback: 1
            }
          };
        var url = service.signAndReturnUrl(service.flickrApiUrl, message);
        SBW.Singletons.utils.ajax({
          url: url,
          type: 'POST',
          dataType: "json"
        }, successCallback, errorCallback);
      },
      callback = (function (service, objectId, successCallback, errorCallback) {
        return function (isLoggedIn) {
          if (isLoggedIn) {
            postLike(objectId, successCallback, errorCallback);
          } else {
            service.startActionHandler(function () {
              postLike(objectId, successCallback, errorCallback);
            });
          }
        };
      })(service, objectId, successCallback, errorCallback);

    service.checkUserLoggedIn(callback);
  },

  /**
   * @method
   * @desc  To unlike an object.
   * @param {String} objectId
   * @param {Callback} successCallback {@link  SBW.Controllers.Services.ServiceController~unlike-successCallback Callback} will be called if unlike is successful
   * @param {Callback} errorCallback {@link  SBW.Controllers.Services.ServiceController~unlike-errorCallback Callback} will be called in case of any error while un liking
   */
  unlike: function (objectId, successCallback, errorCallback) {
    var service = this,
      removeLike = function (objectId, successCallback, errorCallback) {
        var apiKey = service.accessObject.consumerKey,
          message = {
            action: service.flickrApiUrl,
            method: "POST",
            parameters: {
              method: 'flickr.favorites.remove',
              perms: 'write',
              format: 'json',
              photo_id: objectId,
              api_key: apiKey,
              nojsoncallback: 1
            }
          };
        var url = service.signAndReturnUrl(service.flickrApiUrl, message);
        SBW.Singletons.utils.ajax({
          url: url,
          type: 'POST',
          dataType: "json"
        }, successCallback, errorCallback);
      },
      callback = (function (service, objectId, successCallback, errorCallback) {
        return function (isLoggedIn) {
          if (isLoggedIn) {
            removeLike(objectId, successCallback, errorCallback);
          } else {
            service.startActionHandler(function () {
              removeLike(objectId, successCallback, errorCallback);
            });
          }
        };
      })(service, objectId, successCallback, errorCallback);
    service.checkUserLoggedIn(callback);
  },
  /**
   * @method
   * @desc To comment on a photo.
   * @param {String} objectId
   * @param {String} comment
   * @param {Callback} successCallback {@link  SBW.Controllers.Services.ServiceController~postComment-successCallback Callback} will be called if posting is successful
   * @param {Callback} errorCallback {@link  SBW.Controllers.Services.ServiceController~postComment-errorCallback Callback} will be called in case of any error while posting
   */
  postComment: function (objectId, comment, successCallback, errorCallback) {
    var service = this,
      apiKey = service.accessObject.consumerKey,
      publish = function (objectId, comment, successCallback, errorCallback) {
        var message = {
            action: service.flickrApiUrl,
            method: "POST",
            parameters: {
              method: 'flickr.photos.comments.addComment',
              api_key: apiKey,
              format: 'json',
              photo_id: objectId.assetId,
              perms: 'write',
              comment_text: comment,
              oauth_token: service.accessObject.access_token,
              nojsoncallback: 1
            }
          },
          url = service.signAndReturnUrl(service.flickrApiUrl, message);
        SBW.Singletons.utils.ajax({
          url: url,
          type: 'POST',
          dataType: "json"
        }, successCallback, errorCallback);
      },
      callback = (function (objectId, comment, successCallback, errorCallback) {
        return function (isLoggedIn) {
          if (isLoggedIn) {
            publish(objectId, comment, successCallback, errorCallback);
          } else {
            service.startActionHandler(function () {
              publish(objectId, comment, successCallback, errorCallback);
            });
          }
        };
      })(objectId, comment, successCallback, errorCallback);
    service.checkUserLoggedIn(callback);
  },

  /**
   * @method
   * @desc To post a photo to flickr through flickr API service
   * Flickr supports JPEGs, non-animated GIFs, and PNGs. Any other  format is automatically converted to and stored in JPEG format.
   * additional help for photo upload refer to URL: http://www.flickr.com/help/photos/
   * @param {Array} fileData  Array of {@link  SBW.Models.UploadFileMetaData}
   * @param {Callback} successCallback {@link  SBW.Controllers.Services.ServiceController~uploadPhoto-successCallback Callback} will be called if media is uploaded successfully
   * @param {Callback} errorCallback {@link  SBW.Controllers.Services.ServiceController~uploadPhoto-errorCallback Callback} will be called in case of any error while uploading media
   */
  uploadPhoto: function (fileDataArray, successCallback, errorCallback) {
    var service = this;
    fileDataArray.forEach(function (fileData) {
      var apiKey = service.accessObject.consumerKey,
        upload = function (fileData, successCallback, errorCallback) {
          var message = {
              action: service.flickrUploadApiUrl,
              method: "POST",
              parameters: {
                oauth_consumer_key: apiKey,
                oauth_token: service.accessObject.access_token,
                oauth_token_secret: service.accessObject.tokenSecret,
                oauth_callback: service.callbackUrl,
                title: fileData['title'],
                description: fileData['description'],
                is_public: 1
              }
            },
            url = service.signAndReturnUrl(service.flickrUploadApiUrl, message),
            options = {
              url: url,
              type: 'POST',
              dataType: 'xml',
              processData: false,
              fileType: 'photo'
            };
          var filedata = [
            {oauth_consumer_key: apiKey, oauth_token: service.accessObject.access_token, photo: fileData['file'], title: fileData['title'], description: fileData['description'], is_public: 1}
          ];
          SBW.api.fileUpload(['flickr'], filedata, options, successCallback, errorCallback);
        },
        callback = (function (fileData, successCallback, errorCallback) {
          return function (isLoggedIn) {
            if (isLoggedIn) {
              upload(fileData, successCallback, errorCallback);
            } else {
              service.startActionHandler(function () {
                upload(fileData, successCallback, errorCallback);
              });
            }
          };
        })(fileData, successCallback, errorCallback);

      service.checkUserLoggedIn(callback);
    })
  },
  /**
   * @method
   * @desc To post a video to flickr through flickr API service
   * Format supported for video  AVI (Proprietary codecs may not work), WMV, MOV (AVID or other proprietary codecs may not work), MPEG (1, 2, and 4), 3gp, M2TS, OGG, OGV
   * additional help on video upload refer to URL: http://www.flickr.com/help/video/
   * @param {Array} fileData  Array of {@link  SBW.Models.UploadFileMetaData}
   * @param {Callback} successCallback {@link  SBW.Controllers.Services.ServiceController~uploadVideo-successCallback Callback} will be called if media is uploaded successfully
   * @param {Callback} errorCallback {@link  SBW.Controllers.Services.ServiceController~uploadVideo-errorCallback Callback} will be called in case of any error while uploading media
   */
  uploadVideo: function (fileDataArray, successCallback, errorCallback) {
    this.uploadPhoto(fileDataArray, successCallback, errorCallback);
  },
  /**
   * @method
   * @desc utility method to format response from Upload methods
   * @param  {Object} response        [description]
   * @param  {Callback} successCallback [description]
   * @param  {Callback} errorCallback [description]
   */
  postUpload: function (response, successCallback, errorCallback) {
    var resp, key;
    for (key in response) {
      resp = response[key];
    }
    var uploadStatus = new Array(),
      callBack = successCallback;
    if ((resp.getElementsByTagName("photoid").length !== 0)) {
      uploadStatus.push(new SBW.Models.UploadStatus({
        id: resp.getElementsByTagName("photoid")[0].textContent,
        serviceName: 'flickr',
        status: 'success',
        rawData: response
      }));
    } else {
      callBack = errorCallback;
      uploadStatus.push(new SBW.Models.Error({
        message: resp.getElementsByTagName("err")[0].getAttribute('msg'),
        serviceName: 'facebook',
        rawData: response
      }));
    }
    callBack(uploadStatus);
  },
  /**
   * @method
   * @desc To get galleries from logged in user through flickr API service
   * The method doesn't require any authentication
   * @param {String} userId
   * @param {Callback} successCallback
   * @param {Callback} errorCallback
   */
  getGalleries: function (userId, successCallback, errorCallback) {
    var service = this,
      apiKey = service.accessObject.consumerKey,
      message = {
        action: service.flickrApiUrl,
        method: "GET",
        parameters: {
          method: 'flickr.galleries.getList',
          perms: 'write',
          format: 'json',
          user_id: userId,
          api_key: apiKey,
          nojsoncallback: 1
        }
      },
      url = service.signAndReturnUrl(service.flickrApiUrl, message);
    SBW.Singletons.utils.ajax({
        url: url,
        type: 'GET',
        dataType: "json"
      },
      successCallback,
      errorCallback
    );
  },

  /**
   * @method
   * @desc To get likes(favorites) for the photo given through flickr API service
   * The method doesn't require any authentication
   * @param {String} photoId
   * @param {Callback} successCallback {@link  SBW.Controllers.Services.ServiceController~getLikes-successCallback Callback} will be called if data is fetched successfully
   * @param {Callback} errorCallback {@link  SBW.Controllers.Services.ServiceController~getLikes-errorCallback Callback} will be called in case of any error while fetching data
   */
  getLikes: function (photoId, successCallback, errorCallback) {
    var service = this,
      apiKey = service.accessObject.consumerKey,
      message = {
        action: service.flickrApiUrl,
        method: "GET",
        parameters: {
          method: 'flickr.photos.getFavorites',
          perms: 'write',
          format: 'json',
          photo_id: photoId,
          api_key: apiKey,
          nojsoncallback: 1
        }
      },
      url = service.signAndReturnUrl(service.flickrApiUrl, message),
      likeSuccess = function (response) {
        if (response.stat === 'fail') {
          var errorObject = new SBW.Models.Error({
            message: response.message,
            serviceName: 'flickr',
            rawData: response,
            code: response.code
          });
          errorCallback(errorObject);
        } else {
          var likesData = [], i;
          for (i = 0; i < response.photo.person.length; i++) {
            var user = new SBW.Models.User({
              name: response.photo.person[i].username,
              id: response.photo.person[i].nsid,
              userImage: 'http://flickr.com/buddyicons/' + response.photo.person[i].nsid + '.jpg'
            });
            likesData[i] = new SBW.Models.Like({
              user: user,
              rawData: response.photo.person[i]
            });
          }
          var likesObject = {
            serviceName: 'flickr',
            likes: likesData,
            likeCount: likesData.length,
            rawData: response
          };
          // Todo Populating the asset object with the like and user objects
          successCallback(likesObject);
        }
      };
    SBW.Singletons.utils.ajax({
        url: url,
        type: 'GET',
        dataType: "json"
      },
      likeSuccess,
      errorCallback
    );
  },
  /**
   * @method
   * @desc To create a Gallery in the logged in User's account through flickr API service
   * @param {String} title
   * @param {String} description
   * @param {Callback} successCallback
   * @param {Callback} errorCallback
   */
  createGallery: function (title, description, successCallback, errorCallback) {
    var service = this,
      apiKey = service.accessObject.consumerKey,
      newGallery = function (title, description, successCallback, errorCallback) {
        var message = {
            action: service.flickrApiUrl,
            method: "POST",
            parameters: {
              api_key: apiKey,
              description: description,
              title: title,
              format: 'json',
              method: 'flickr.galleries.create',
              oauth_token: service.accessObject.access_token,
              perms: 'write',
              nojsoncallback: 1
            }
          },
          url = service.signAndReturnUrl(service.flickrApiUrl, message);
        SBW.Singletons.utils.ajax({
            url: url,
            type: 'POST',
            dataType: 'json'
          },
          successCallback,
          errorCallback);
      },
      callback = (function (title, description, successCallback, errorCallback) {
        return function (isLoggedIn) {
          if (isLoggedIn) {
            newGallery(title, description, successCallback, errorCallback);
          } else {
            service.startActionHandler(function () {
              newGallery(title, description, successCallback, errorCallback);
            });
          }
        };
      })(title, description, successCallback, errorCallback);
    service.checkUserLoggedIn(callback);
  },
  /**
   * @method
   * @desc To add a photo to logged in User's gallery through flickr API service
   * @param {String} galleryId
   * @param {String} photoId
   * @param {Callback} successCallback
   * @param {Callback} errorCallback
   */
  addPhotoToGallery: function (galleryId, photoId, successCallback, errorCallback) {
    var service = this;
    var apiKey = service.accessObject.consumerKey;
    var addPhoto = function (galleryId, photoId, successCallback, errorCallback) {
      var message = {
        action: service.flickrApiUrl,
        method: "POST",
        parameters: {
          api_key: apiKey,
          gallery_id: galleryId,
          method: 'flickr.galleries.addPhoto',
          format: 'json',
          oauth_token: service.accessObject.access_token,
          perms: 'write',
          photo_id: photoId,
          nojsoncallback: 1
        }
      };
      var url = service.signAndReturnUrl(service.flickrApiUrl, message);
      SBW.Singletons.utils.ajax({
          url: url,
          type: 'POST',
          dataType: 'json'
        },
        successCallback,
        errorCallback);
    };
    var callback = (function (galleryId, photoId, successCallback, errorCallback) {
      return function (isLoggedIn) {
        if (isLoggedIn) {
          addPhoto(galleryId, photoId, successCallback, errorCallback);
        } else {
          service.startActionHandler(function () {
            addPhoto(galleryId, photoId, successCallback, errorCallback);
          });
        }
      };
    })(galleryId, photoId, successCallback, errorCallback);
    service.checkUserLoggedIn(callback);
  },

  /**
   * @method
   * @desc To get contacts of the user logged in through flickr API service
   * @param {Callback} successCallback
   * @param {Callback} errorCallback
   */
  getContacts: function (successCallback, errorCallback) {
    var service = this;
    var apiKey = service.accessObject.consumerKey;
    var getData = function (successCallback, errorCallback) {
      var message = {
        action: service.flickrApiUrl,
        method: "GET",
        parameters: {
          api_key: apiKey,
          format: 'json',
          method: 'flickr.contacts.getList',
          oauth_token: service.accessObject.access_token,
          perms: 'read',
          nojsoncallback: 1
        }
      };
      var url = service.signAndReturnUrl(service.flickrApiUrl, message);
      SBW.Singletons.utils.ajax({
          url: url,
          type: 'GET',
          dataType: 'json'
        },
        successCallback,
        errorCallback);
    };
    var callback = (function (successCallback, errorCallback) {
      return function (isLoggedIn) {
        if (isLoggedIn) {
          getData(successCallback, errorCallback);
        } else {
          service.startActionHandler(function () {
            getData(successCallback, errorCallback);
          });
        }
      };
    })(successCallback, errorCallback);
    service.checkUserLoggedIn(callback);
  },

  /**
   * @method
   * @desc To get groups of the logged in user through flickr API service
   * @param {Callback} successCallback
   * @param {Callback} errorCallback
   */
  getGroups: function (successCallback, errorCallback) {
    var service = this;
    var getData = function (successCallback, errorCallback) {
      var userId = service.accessObject.id;
      var apiKey = service.accessObject.consumerKey;
      var message = {
        action: service.flickrApiUrl,
        method: "GET",
        parameters: {
          method: 'flickr.people.getGroups',
          perms: 'read',
          format: 'json',
          api_key: apiKey,
          nojsoncallback: 1
        }
      };
      var url = service.signAndReturnUrl(service.flickrApiUrl, message);
      SBW.Singletons.utils.ajax({
          url: url,
          type: 'GET',
          dataType: 'json'
        },
        successCallback,
        errorCallback);
    };
    var callback = (function (successCallback, errorCallback) {
      return function (isLoggedIn) {
        if (isLoggedIn) {
          getData(successCallback, errorCallback);
        } else {
          service.startActionHandler(function () {
            getData(successCallback, errorCallback);
          });
        }
      };
    })(successCallback, errorCallback);

    service.checkUserLoggedIn(callback);
  },
  /**
   * @method
   * @desc To get the logged in User profile information through Flickr API service
   * method doesn't require any authentication
   * @param {String} userId
   * @param {Callback} successCallback
   * @param {Callback} errorCallback
   */
  getUserInfo: function (userId, successCallback, errorCallback) {
    var service = this;
    var apiKey = service.accessObject.consumerKey;
    var message = {
      action: service.flickrApiUrl,
      method: "GET",
      parameters: {
        method: 'flickr.people.getInfo',
        format: 'json',
        user_id: userId,
        api_key: apiKey,
        nojsoncallback: 1
      }
    };
    var url = service.signAndReturnUrl(service.flickrApiUrl, message);
    SBW.Singletons.utils.ajax({
        url: url,
        type: 'GET',
        dataType: 'json'
      },
      successCallback,
      errorCallback);
  },
  /**
   * @method
   * @desc To get comments of a Photo through Flickr API service
   * method doesn't require any authentication
   * @param {Object} idObject
   * @param {Callback} successCallback {@link  SBW.Controllers.Services.ServiceController~getComments-successCallback Callback} will be called if data is fetched successfully
   * @param {Callback} errorCallback {@link  SBW.Controllers.Services.ServiceController~getComments-errorCallback Callback} will be called in case of any error while fetching data
   */
  getComments: function (idObject, successCallback, errorCallback) {
    var service = this;
    var apiKey = service.accessObject.consumerKey;
    var message = {
      action: service.flickrApiUrl,
      method: "GET",
      parameters: {
        method: 'flickr.photos.comments.getList',
        format: 'json',
        photo_id: idObject.assetId,
        api_key: apiKey,
        nojsoncallback: 1
      }
    };
    var commentSuccess = function (result) {
      var commentsData = [];
      for (var i = 0; i < result.comments.comment.length; i++) {
        commentsData[i] = new SBW.Models.Comment({
          createdTime: result.comments.comment[i].datecreate,
          fromUser: result.comments.comment[i].authorname,
          fromUserId: result.comments.comment[i].author,
          likeCount: null,
          text: result.comments.comment[i]._content,
          rawData: result.comments.comment[i],
          serviceName: "flickr",
          id: result.comments.comment[i].id,
          userImage: 'http://flickr.com/buddyicons/' + result.comments.comment[i].author + '.jpg'
        });
      }
      successCallback(commentsData);
    };
    var url = service.signAndReturnUrl(service.flickrApiUrl, message);
    SBW.Singletons.utils.ajax({
        url: url,
        type: 'GET',
        dataType: 'json'
      },
      commentSuccess,
      errorCallback);
  },
  /**
   * @method
   * @desc To get the url for photos posted in flickr by the logged in user through Flickr API service
   * @param {Callback} successCallback
   * @param {Callback} errorCallback
   */
  getPhotoUrl: function (successCallback, errorCallback) {
    var service = this;
    var getData = function (successCallback, errorCallback) {
      var userId = service.accessObject.id;
      var apiKey = service.accessObject.consumerKey;
      var message = {
        action: service.flickrApiUrl,
        method: "GET",
        parameters: {
          method: 'flickr.urls.getUserPhotos',
          format: 'json',
          user_id: userId,
          api_key: apiKey,
          nojsoncallback: 1
        }
      };
      var url = service.signAndReturnUrl(service.flickrApiUrl, message);
      SBW.Singletons.utils.ajax({
          url: url,
          type: 'GET',
          dataType: 'json'
        },
        successCallback,
        errorCallback);
    };
    var callback = (function (successCallback, errorCallback) {
      return function (isLoggedIn) {
        if (isLoggedIn) {
          getData(successCallback, errorCallback);
        } else {
          service.startActionHandler(function () {
            getData(successCallback, errorCallback);
          });
        }
      };
    })(successCallback, errorCallback);

    service.checkUserLoggedIn(callback);
  },
  /**
   * @method
   * @desc To get albums from a logged in user through flickr API service
   * The method doesn't require any authentication
   * @param {String} userId
   * @param {Callback} successCallback
   * @param {Callback} errorCallback
   */
  getAlbums: function (successCallback, errorCallback, userId) {
    var service = this;
    userId = ((userId !== undefined) ? userId : service.accessObject.id );
    var getData = function (userId, successCallback, errorCallback) {
      var apiKey = service.accessObject.consumerKey;
      var message = {
        action: service.flickrApiUrl,
        method: "GET",
        parameters: {
          method: 'flickr.photosets.getList',
          perms: 'write',
          format: 'json',
          user_id: userId,
          api_key: apiKey,
          nojsoncallback: 1
        }
      };
      var url = service.signAndReturnUrl(service.flickrApiUrl, message);
      if (service.content.length > 0) {
        successCallback(service.content);
      } else {
        SBW.Singletons.utils.ajax({
            url: url,
            type: 'GET',
            dataType: "json"
          },
          function (response) {
            if (response.stat === 'fail') {
              var errorObject = new SBW.Models.Error({
                message: response.message,
                serviceName: 'flickr',
                rawData: response,
                code: response.code
              });
              errorCallback(errorObject);
            } else {
              var albums = response.photosets.photoset;
              albums.forEach(function (album) {
                var collection = new SBW.Models.AssetCollection({
                  id: '',
                  title: album.title._content,
                  createdTime: new Date().getTime(),
                  rawData: album,
                  status: 'private',
                  serviceName: 'flickr',
                  assets: [],
                  metadata: {
                    dateUpdated: new Date(album.date_update * 1000).toDateString(),
                    dateUploaded: new Date(album.date_create * 1000).toDateString(),
                    numAssets: album.photos,
                    assetCollectionId: album.id,
                    type: 'image',
                    tags: null,
                    fileName: null,
                    description: album.description._content,
                    thumbnail: 'http://farm' + album.farm + '.staticflickr.com/' + album.server + '/' + album.primary + '_' + album.secret + '.jpg',
                    previewUrl: 'http://farm' + album.farm + '.staticflickr.com/' + album.server + '/' + album.primary + '_' + album.secret + '.jpg',
                    author: null,
                    authorAvatar: null,
                    commentCount: album.count_comments,
                    comments: null,
                    likeCount: 0,
                    likes: null
                  }
                });
                collection.id = collection.getID();
                service.content.push(collection);
              });
              successCallback(service.content);
            }
          },
          errorCallback
        );
      }
    };
    var callback = (function (userId, successCallback, errorCallback) {
      return function (isLoggedIn) {
        if (isLoggedIn) {
          getData(userId, successCallback, errorCallback);
        } else {
          service.startActionHandler(function () {
            getData(userId, successCallback, errorCallback);
          });
        }
      };
    })(userId, successCallback, errorCallback);
    service.checkUserLoggedIn(callback);
  },
  /**
   * @method
   * @desc To get album(photo set) information from a logged in user through flickr API service
   * The method doesn't require any authentication
   * @param {String} photoSetId
   * @param {Callback} successCallback
   * @param {Callback} errorCallback
   */
  getAlbumInfo: function (photoSetId, successCallback, errorCallback) {
    var service = this;
    var apiKey = service.accessObject.consumerKey;
    var message = {
      action: service.flickrApiUrl,
      method: "GET",
      parameters: {
        method: 'flickr.photosets.getInfo',
        perms: 'write',
        format: 'json',
        photoset_id: photoSetId,
        api_key: apiKey,
        nojsoncallback: 1
      }
    };
    var url = service.signAndReturnUrl(service.flickrApiUrl, message);
    SBW.Singletons.utils.ajax({
        url: url,
        type: 'GET',
        dataType: "json"
      },
      successCallback,
      errorCallback
    );
  },
  /**
   * @method
   * @desc To get comments on an album(photo set) from a logged in user through flickr API service
   * The method doesn't require any authentication
   * @param {String} photoSetId
   * @param {Callback} successCallback
   * @param {Callback} errorCallback
   */
  getAlbumComments: function (photoSetId, successCallback, errorCallback) {
    var service = this;
    var apiKey = service.accessObject.consumerKey;
    var message = {
      action: service.flickrApiUrl,
      method: "GET",
      parameters: {
        method: 'flickr.photosets.comments.getList',
        perms: 'write',
        format: 'json',
        photoset_id: photoSetId,
        api_key: apiKey,
        nojsoncallback: 1
      }
    };
    var url = service.signAndReturnUrl(service.flickrApiUrl, message);
    SBW.Singletons.utils.ajax({
        url: url,
        type: 'GET',
        dataType: "json"
      },
      successCallback,
      errorCallback
    );
  },
  /**
   * @method
   * @desc To get comments on an album(photo set) from a logged in user through flickr API service
   * The method doesn't require any authentication
   * @param {String} photoSetId
   * @param {Callback} successCallback
   * @param {Callback} errorCallback
   */
  getPhotosFromAlbum: function (photoSetId, successCallback, errorCallback) {
    var service = this;
    var apiKey = service.accessObject.consumerKey;
    var message = {
      action: service.flickrApiUrl,
      method: "GET",
      parameters: {
        method: 'flickr.photosets.getPhotos',
        perms: 'write',
        format: 'json',
        photoset_id: photoSetId,
        api_key: apiKey,
        nojsoncallback: 1
      }
    };
    var url = service.signAndReturnUrl(service.flickrApiUrl, message);
    assetFound = false;
    service.content.forEach(function (collectionValue, collectionIndex, serviceContentArray) {
      if (collectionValue.metadata.assetCollectionId === photoSetId) {
        if (collectionValue.assets.length > 0) {
          successCallback(collectionValue.assets);
          assetFound = true;
        }
      }
    });
    if (!assetFound) {
      SBW.Singletons.utils.ajax({
          url: url,
          type: 'GET',
          dataType: "json"
        }, function (response) {
          if (response.stat === 'fail') {
            var errorObject = new SBW.Models.Error({
              message: response.message,
              serviceName: 'flickr',
              rawData: response,
              code: response.code
            });
            errorCallback(errorObject);
          } else {
            var content = new Array();
            var assets = response.photoset.photo;
            assets.forEach(function (asset) {
              var collection = new SBW.Models.ImageAsset({
                src: 'http://farm' + asset.farm + '.staticflickr.com/' + asset.server + '/' + asset.id + '_' + asset.secret + '.jpg',
                id: '',
                title: asset.title,
                createdTime: new Date().getTime(),
                serviceName: 'flickr',
                rawData: asset,
                status: 'private',
                imgSizes: {t: '', s: '', m: '', l: ''},
                metadata: {
                  caption: null,
                  type: null,
                  dateTaken: null,
                  dateUpdated: null,
                  dateUploaded: null,
                  comments: null,
                  size: null,
                  assetId: asset.id,
                  assetCollectionId: response.photoset.id,
                  height: null,
                  width: null,
                  commentCount: null,
                  category: null,
                  exifMake: null,
                  exifModel: null,
                  iptcKeywords: null,
                  orientation: null,
                  tags: null,
                  downloadUrl: null,
                  originalFormat: null,
                  fileName: null,
                  version: null,
                  description: null,
                  thumbnail: null,
                  previewUrl: 'http://farm' + asset.farm + '.staticflickr.com/' + asset.server + '/' + asset.id + '_' + asset.secret + '.jpg',
                  author: new SBW.Models.User({
                    name: response.photoset.ownername,
                    id: response.photoset.owner,
                    userImage: 'http://flickr.com/buddyicons/' + response.photoset.owner + '.jpg'
                  }),
                  authorAvatar: null,
                  likeCount: 0,
                  likes: null
                }
              });
              collection.id = collection.getID();
              content.push(collection);
            });
            service.content.forEach(function (assetCollection) {
              if (assetCollection.metadata.assetCollectionId === photoSetId) {
                assetCollection.assets = content;
              }
            });
            successCallback(content);
          }
        },
        errorCallback
      );
    }
  },
  /**
   * @method
   * @desc To get photos of the logged in user through Flickr API service
   * @param {Callback} successCallback
   * @param {Callback} errorCallback
   */
  getPhotos: function (successCallback, errorCallback) {
    var service = this;
    var getData = function (successCallback, errorCallback) {
      var userId = service.accessObject.id;
      var apiKey = service.accessObject.consumerKey;
      var imageArray = [];
      var message = {
        action: service.flickrApiUrl,
        method: "GET",
        parameters: {
          method: 'flickr.people.getPhotos',
          format: 'json',
          user_id: userId,
          api_key: apiKey,
          nojsoncallback: 1
        }
      };
      var url = service.signAndReturnUrl(service.flickrApiUrl, message);
      var success = function (response) {
        if (response.stat === 'fail') {
          var errorObject = new SBW.Models.Error({
            message: response.message,
            serviceName: 'flickr',
            rawData: response,
            code: response.code
          });
          errorCallback(errorObject);
        } else {
          var photoArray = response.photos.photo;
          for (var i = 0; i < photoArray.length; i++) {
            imageArray[i] = new SBW.Models.ImageAsset({
              src: 'http://farm' + photoArray[i].farm + '.staticflickr.com/' + photoArray[i].server + '/' + photoArray[i].id + '_' + photoArray[i].secret + '.jpg',
              id: '',
              title: photoArray[i].title,
              createdTime: new Date().getTime(),
              serviceName: 'flickr',
              rawData: photoArray[i],
              imgSizes: {t: '', s: '', m: '', l: ''},
              metadata: {
                caption: null,
                type: null,
                dateTaken: null,
                dateUpdated: null,
                dateUploaded: null,
                comments: null,
                size: null,
                assetId: photoArray[i].id,
                assetCollectionId: null,
                height: null,
                width: null,
                commentCount: '',
                category: null,
                exifMake: null,
                exifModel: null,
                iptcKeywords: null,
                orientation: '',
                tags: '',
                downloadUrl: null,
                originalFormat: '',
                fileName: null,
                version: null,
                description: '',
                thumbnail: null,
                previewUrl: 'http://farm' + photoArray[i].farm + '.staticflickr.com/' + photoArray[i].server + '/' + photoArray[i].id + '_' + photoArray[i].secret + '.jpg',
                author: new SBW.Models.User({
                  name: service.user.name,
                  id: photoArray[i].owner,
                  userImage: 'http://flickr.com/buddyicons/' + photoArray[i].owner + '.jpg'
                }),
                authorAvatar: null,
                likeCount: '',
                likes: null
              }
            });
            imageArray[i].id = imageArray[i].getID();
          }
          successCallback(imageArray);
        }
        ;
      }
      SBW.Singletons.utils.ajax({
          url: url,
          type: 'GET',
          dataType: 'json',
          processData: true
        },
        success,
        errorCallback);
    };
    var callback = (function (successCallback, errorCallback) {
      return function (isLoggedIn) {
        if (isLoggedIn) {
          getData(successCallback, errorCallback);
        } else {
          service.startActionHandler(function () {
            getData(successCallback, errorCallback);
          });
        }
      };
    })(successCallback, errorCallback);
    service.checkUserLoggedIn(callback);
  },
  /**
   * @method
   * @desc To get the information of a photo posted on flickr.
   * This method doesn't require any authentication
   * @param {String} photoId
   * @param {Callback} successCallback
   * @param {Callback} errorCallback
   */
  getPhotoInfo: function (photoId, successCallback, errorCallback) {
    var service = this;
    var apiKey = service.accessObject.consumerKey;
    var message = {
      action: service.flickrApiUrl,
      method: "GET",
      parameters: {
        method: 'flickr.photos.getInfo',
        format: 'json',
        photo_id: photoId,
        api_key: apiKey,
        nojsoncallback: 1
      }
    };
    var url = service.signAndReturnUrl(service.flickrApiUrl, message);
    SBW.Singletons.utils.ajax({
        url: url,
        type: 'GET',
        dataType: 'json'},
      function (response) {
        if (response.stat === 'fail') {
          var errorObject = new SBW.Models.Error({
            message: response.message,
            serviceName: 'flickr',
            rawData: response,
            code: response.code
          });
          errorCallback(errorObject);
        } else {
          var photo = response.photo;
          var asset = new SBW.Models.ImageAsset({
            src: 'http://farm' + photo.farm + '.staticflickr.com/' + photo.server + '/' + photo.id + '_' + photo.secret + '.jpg',
            id: '',
            title: photo.title._content,
            createdTime: new Date().getTime(),
            serviceName: 'flickr',
            rawData: photo,
            status: photo.visibility,
            imgSizes: {t: '', s: '', m: '', l: ''},
            metadata: {
              caption: null,
              type: null,
              dateTaken: new Date(photo.dates.taken * 1000).toDateString(),
              dateUpdated: new Date(photo.dates.lastupdate * 1000).toDateString(),
              dateUploaded: new Date(photo.dateuploaded * 1000).toDateString(),
              comments: null,
              size: null,
              assetId: photo.id,
              assetCollectionId: null,
              height: null,
              width: null,
              commentCount: photo.comments._content,
              category: null,
              exifMake: null,
              exifModel: null,
              iptcKeywords: null,
              orientation: photo.rotation,
              tags: photo.tags,
              downloadUrl: null,
              originalFormat: photo.originalformat,
              fileName: null,
              version: null,
              description: photo.description._content,
              thumbnail: null,
              previewUrl: 'http://farm' + photo.farm + '.staticflickr.com/' + photo.server + '/' + photo.id + '_' + photo.secret + '.jpg',
              author: new SBW.Models.User({
                name: photo.owner.username,
                id: photo.owner.nsid,
                userImage: 'http://flickr.com/buddyicons/' + photo.owner.nsid + '.jpg'
              }),
              authorAvatar: null,
              likeCount: photo.isfavorite,
              likes: null
            }
          });
          asset.id = asset.getID();
          service.content.forEach(function (assetCollection) {
            assetCollection.assets.forEach(function (ImageAsset, index, array) {
              if (ImageAsset.metadata.assetId === photoId) {
                array[index] = asset;
              }
            })
          });
          successCallback(asset)
        }
      },
      errorCallback);
  },
  /**
   * @method
   * @desc Method to get the profile image(buddy icon) of the logged in user
   * @param {String} userId
   * @param {Callback} successCallback {@link  SBW.Controllers.Services.ServiceController~getProfilePic-successCallback Callback} will be called if data is fetched successfully
   * @param {Callback} errorCallback {@link  SBW.Controllers.Services.ServiceController~getProfilePic-errorCallback Callback} will be called in case of any error while fetching data
   */
  getProfilePic: function (userId, successCallback, errorCallback) {
    var service = this;
    userId = ((userId) ? userId : service.accessObject.id );
    if (userId) {
      var profilePicUrl = 'http://flickr.com/buddyicons/' + userId + '.jpg';
      successCallback(profilePicUrl);
    } else {
      errorCallback();
    }
  },
  /**
   * @method
   * @desc This function is called for resetting the flickr's accessObject. Called when the user clicks on change link.
   */
  logoutHandler: function (callback) {
    var service = this;
    service.accessObject['access_token'] = null;
    service.accessObject.id = null;
    callback();
  }
});
/**
 * @class  Google Plus
 * @classdesc This is Google Plus service implementation
 * @augments ServiceController
 * @constructor
 */

SBW.Controllers.Services.GooglePlus = SBW.Controllers.Services.ServiceController.extend(/** @lends SBW.Controllers.Services.GooglePlus# */{
  /** @constant */
  name: 'googleplus',
  /** @constant */
  icon: 'googleplus',
  /** @constant */
  title: 'Google Plus',
  /** Method init : Initialize method to setup require items
   */
  init: function () {
    var clientID = SBW.Singletons.config.services.GooglePlus.clientID;
    var callbackURL = SBW.Singletons.utils.callbackURLForService('GooglePlus');
    this.accessObject = {
      clientId: clientID,
      callbackUrl: callbackURL,
      accessTokenUrl: 'https://accounts.google.com/o/oauth2/auth?client_id=' + clientID + '&scope=https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/plus.me&response_type=token&redirect_uri=' + callbackURL,
      access_token: null,
      apiKey: SBW.Singletons.config.services.GooglePlus.apiKey,
      baseURL: "https://www.googleapis.com/plus/v1"
    };
  },
  /**
   * Method startActionHandler : Triggers authentication process to the googlePlus service.
   * @param {callback} callback
   */
  startActionHandler: function (callback) {
    var service = this;
    var accessTokenListner = function (windowRef) {
      if (!windowRef.closed) {
        if (service.getCookie('googleplusToken')) {
          windowRef.close();
          service.getAccessToken.call(service, callback);
        } else {
          setTimeout(function () {
            accessTokenListner(windowRef);
          }, 2000);
        }
      }
    };

    if (service.authWindowReference === null || service.authWindowReference.closed) {
      service.authWindowReference = window.open(service.accessObject['accessTokenUrl'], 'googleplus' + new Date().getTime(), service.getPopupWindowParams({height: 500, width: 400}));
      accessTokenListner(service.authWindowReference);
    } else {
      service.authWindowReference.focus();
    }
  },
  /**
   * Method checkUserLoggedIn : Checks whether user is logged-in and has an authenticated session to service.
   * @param {callback} callback Callback function that will be called after checking login status
   */
  checkUserLoggedIn: function (callback) {
    var service = this;
    var access_token = service.accessObject['access_token'];
    var url = "https://accounts.google.com/o/oauth2/tokeninfo?v=2.1&access_token=" + access_token;
    $.getJSON(url, 'callback=?', function (response) {
      if (response.error) {
        callback(false);
      } else {
        callback(true);
      }
    });
  },
  /**
   * Method getAccessToken : Retrieves access tokens from cookie and sets it to accessObject
   * @param {callback} callback callback function to be called after fetching access token
   */
  getAccessToken: function (callback) {
    var service = this;
    var _cookie = service.getCookie('googleplusToken');
    if (_cookie != "undefined") {
      service.accessObject['access_token'] = _cookie;
      callback();
    } else {
      //service.failureLoginHandler.call(service, null);
    }
  },
  /**
   * Method _getData : Helps us fetch specific set of data
   * @param {object} context object that has type of request and post/profile id
   * @param {callback} callback
   */
  _getData: function (context, callback) {
    var service = this, url = service.accessObject['baseURL'];
    if (context.method === 'list') {
      if (context.type === 'activities') {
        url += "/people/" + context.id + "/activities/public";
      } else if (context.type === 'comments') {
        url += "/activities/" + context.id + "/comments";
      }
    } else if (context.method === 'get') {
      url += "/" + context.type + "/" + context.id;
    }
    url += "?key=" + service.accessObject['apiKey'];
    if (context.nextPageToken) {
      url += "&pageToken=" + context.nextPageToken;
    }
    $.getJSON(url, 'callback=?',
      function (response) {
        callback(response);
      }
    );
  },
  /**
   * Method _getAllData : Helps us retrieve all the data of a particular context
   * @param {object} context
   * @param {callback} successCallback - success callback will get called if data is fetched successfully
   * @param {callback} errorCallback - failure callback will get called in case of any error while fetching data
   */
  _getAllData: function (context, successCallback, errorCallback) {
    var service = this, posts = [];
    var callback = (function (successCallback, errorCallback) {
      return function (response) {
        if (response && !response.error) {
          if (response.items) {
            for (var i = 0, len = response.items.length; i < len; i++) {
              posts.push(response.items[i]);
            }
          } else {
            posts.push(response);
          }
          if (response.nextPageToken) {
            context.nextPageToken = response.nextPageToken;
            service._getData(context, callback);
          } else {
            posts = posts.length == 1 ? posts[0] : posts;
            if (successCallback) {
              successCallback(posts);
            }
          }
        } else {
          if (errorCallback) {
            errorCallback(response);
          }
        }
      };
    })(successCallback, errorCallback);
    service._getData(context, callback);
  },
  /**
   * Method getPosts : Retrieves activities of the user
   * @param userId
   * @param {callback} successCallback - success callback will get called if data is fetched successfully
   * @param {callback} errorCallback - failure callback will get called in case of any error while fetching data
   */
  getPosts: function (userId, successCallback, errorCallback) {
    var service = this;
    var callback = (function (successCallback, errorCallback) {
      return function (isLoggedIn) {
        if (isLoggedIn) {
          service._getAllData({type: 'activities', method: 'list', id: userId}, successCallback, errorCallback);
        } else {
          service.startActionHandler(function () {
            service._getAllData({type: 'activities', method: 'list', id: userId}, successCallback, errorCallback);
          });
        }
      };
    })(successCallback, errorCallback);
    service.checkUserLoggedIn(callback);
  },
  /**
   *  Method getComments : Retrieves comments of an activity
   * @param {Object} idObject
   * @param {callback} successCallback - success callback will get called if data is fetched successfully
   * @param {callback} errorCallback - failure callback will get called in case of any error while fetching data
   */
  getComments: function (idObject, successCallback, errorCallback) {
    var service = this;
    var callback = (function (successCallback, errorCallback) {
      return function (isLoggedIn) {
        if (isLoggedIn) {
          service._getAllData({type: 'comments', method: 'list', id: idObject.assetId}, successCallback, errorCallback);
        } else {
          service.startActionHandler(function () {
            service._getAllData({type: 'comments', method: 'list', id: idObject.assetId}, successCallback, errorCallback);
          });
        }
      };
    })(successCallback, errorCallback);
    service.checkUserLoggedIn(callback);
  },
  /**
   *  Method getProfile : Retrieves profile of the user
   * @param userId
   * @param {callback} successCallback - success callback will get called if data is fetched successfully
   * @param {callback} errorCallback - failure callback will get called in case of any error while fetching data
   */
  getProfile: function (userId, successCallback, errorCallback) {
    var service = this;
    var callback = (function (successCallback, errorCallback) {
      return function (isLoggedIn) {
        if (isLoggedIn) {
          service._getAllData({type: 'people', method: 'get', id: userId}, successCallback, errorCallback);
        } else {
          service.startActionHandler(function () {
            service._getAllData({type: 'people', method: 'get', id: userId}, successCallback, errorCallback);
          });
        }
      };
    })(successCallback, errorCallback);
    service.checkUserLoggedIn(callback);
  },
  /**
   *  Method getPostByID : Retrieves a particular activity based on id
   * @param activityID
   * @param {callback} successCallback - success callback will get called if data is fetched successfully
   * @param {callback} errorCallback - failure callback will get called in case of any error while fetching data
   */
  getPostByID: function (activityID, successCallback, errorCallback) {
    var service = this;
    var callback = (function (successCallback, errorCallback) {
      return function (isLoggedIn) {
        if (isLoggedIn) {
          service._getAllData({type: 'activities', method: 'get', id: activityID}, successCallback, errorCallback);
        } else {
          service.startActionHandler(function () {
            service._getAllData({type: 'activities', method: 'get', id: activityID}, successCallback, errorCallback);
          });
        }
      };
    })(successCallback, errorCallback);
    service.checkUserLoggedIn(callback);
  },
  /**
   *  Method getCommentByID : Retrieves a particular comment
   * @param commentID
   * @param {callback} successCallback - success callback will get called if data is fetched successfully
   * @param {callback} errorCallback - failure callback will get called in case of any error while fetching data
   */
  getCommentByID: function (commentID, successCallback, errorCallback) {
    var service = this;
    var callback = (function (successCallback, errorCallback) {
      return function (isLoggedIn) {
        if (isLoggedIn) {
          service._getAllData({type: 'comments', method: 'get', id: commentID}, successCallback, errorCallback);
        } else {
          service.startActionHandler(function () {
            service._getAllData({type: 'comments', method: 'get', id: commentID}, successCallback, errorCallback);
          });
        }
      };
    })(successCallback, errorCallback);
    service.checkUserLoggedIn(callback);
  }
});
/**
 * @class  LinkedIn
 * @classdesc This is Linkedin service implementation
 * @augments ServiceController
 * @constructor
 **/

SBW.Controllers.Services.LinkedIn = SBW.Controllers.Services.ServiceController.extend(/** @lends SBW.Controllers.Services.LinkedIn# */{
  /**
   * @constant
   * @type {string}
   * @desc The service name
   **/
  name: 'linkedin',
  /**
   * @constant
   * @desc The icon class
   * @type {string}
   **/
  icon: 'linkedin',
  /**
   * @constant
   * @desc The title of the service
   * @type {string}
   **/
  title: 'linkedin',
  /** Instance variable.
   * @desc To check if linkedin is initialized or not
   * @type {boolean}
   */
  linkedInInit: false,
  /**
   * @method
   * @desc Initial parameter initialization or setup
   */
  init: function () {
    this.accessObject = {
      appId: SBW.Singletons.config.services.LinkedIn.apiKey,
      token: null
    };
    this.setup();
  },
  /**
   * @method
   * @desc Resetting the class values
   */
  setup: function () {
    var self = this;
    $(document).ready(function () {
      var scriptEle = document.createElement('script'), done = false;
      scriptEle.src = "//platform.linkedin.com/in.js?async=true";
      scriptEle.onload = scriptEle.onreadystatechange = function () {
        if (!done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
          done = true;
          IN.init({
            api_key: self.accessObject.appId,
            // scope parameters are required based upon on the member permissions
            //  Permission                Scope
            //  User Profile Overview     r_basicprofile
            //  User Full Profile         r_fullprofile
            //  User Email Address		    r_emailaddress
            //  User Connections	        r_network
            //  User Contact Info		      r_contactinfo
            //  Network Updates           rw_nus
            //  Group Discussions		      rw_groups
            //  Invitations and Messages	w_messages
            scope: 'r_network rw_nus r_fullprofile',
            authorize: true
          });
          // Handle memory leak in IE
          scriptEle.onload = scriptEle.onreadystatechange = null;
          self.linkedInInit = true;
        }
      };
      var head = document.getElementsByTagName("head")[0] || document.documentElement;
      head.insertBefore(scriptEle, head.firstChild);
    });
  },

  /**
   * @method
   * @triggers authentication process to the linkedin service.
   **/
  startActionHandler: function (callback) {
    var service = this;
    if (service.linkedInInit && IN.User) {
      if (IN.User.isAuthorized()) {
        callback();
      } else {
        IN.User.authorize(function (response) {
          callback();
        });
      }
    } else {
      setTimeout(function () {
        service.startActionHandler();
      }, 1000);
    }
  },

  /**
   * @method
   * @desc Method to check whether user is logged in(has an authenticated session to service).
   * @param {callback} callback Callback function that will be called after checking login status
   **/
  checkUserLoggedIn: function (callback) {
    var service = this;
    if (service.linkedInInit && IN.User) {
      if (IN.User.isAuthorized()) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      setTimeout(function () {
        service.checkUserLoggedIn(callback);
      }, 1000);
    }
  },

  /**
   * @method
   * @desc To post a message to LinkedIn through its API service
   * @param {string} message the message to be published
   * @param {callback} successCallback - success callback will get called if publishing is successful
   * @param {callback} errorCallback - failure callback will get called in case of any error while publishing
   */
  publishMessage: function (message, successCallback, errorCallback) {
    var service = this,
      publish = function (message, successCallback, errorCallback) {
        IN.API.Raw("/people/~/current-status")
          .method("PUT")
          .body(JSON.stringify(message))
          .result(function (result) {
            successCallback({id: "n/a", serviceName: "linkedin"}, result);
          })
          .error(function (error) {
            var errorObject = new SBW.Models.Error({
              message: error.message,
              serviceName: 'linkedin',
              rawData: error,
              code: error.errorCode
            });
            SBW.logger.debug("Could not publish message");
            errorCallback(errorObject);
          });
      },
      callback = (function (message, successCallback, errorCallback) {
        return function (isLoggedIn) {
          if (isLoggedIn) {
            publish(message, successCallback, errorCallback);
          } else {
            service.startActionHandler(function () {
              publish(message, successCallback, errorCallback);
            });
          }
        };
      })(message, successCallback, errorCallback);

    service.checkUserLoggedIn(callback);
  },

  /**
   * @method
   * @desc To post a comment to LinkedIn through its API service
   * @param {String} objectId The id of the object against which the comment would be posted
   * @param {string} comment the text to be posted as a comment
   * @param {callback} successCallback - success callback will get called if posting is successful
   * @param {callback} errorCallback - failure callback will get called in case of any error while posting
   */
  postComment: function (objectId, comment, successCallback, errorCallback) {
    var service = this,
      publish = function (objectId, comment, successCallback, errorCallback) {
        var content = {"comment": comment};
        IN.API.Raw("/people/~/network/updates/key=" + objectId + "/update-comments")
          .method("POST")
          .body(JSON.stringify(content))
          .result(function (result) {
            successCallback(result);
          })
          .error(function (error) {
            var errorObject = new SBW.Models.Error({
              message: error.message,
              serviceName: 'linkedin',
              rawData: error,
              code: error.errorCode
            });
            SBW.logger.debug("Could not post message");
            errorCallback(errorObject);
          });
      },
      callback = (function (objectId, comment, successCallback, errorCallback) {
        return function (isLoggedIn) {
          if (isLoggedIn) {
            publish(objectId, comment, successCallback, errorCallback);
          } else {
            service.startActionHandler(function () {
              publish(objectId, comment, successCallback, errorCallback);
            });
          }
        };
      })(objectId, comment, successCallback, errorCallback);

    service.checkUserLoggedIn(callback);
  },

  /**
   * @method
   * @desc To like an object on LinkedIn through its API service
   * @param {String} objectId The object to like
   * @param {Callback} successCallback {@link  SBW.Controllers.Services.ServiceController~like-successCallback Callback} will be called if like is successful
   * @param {Callback} errorCallback {@link  SBW.Controllers.Services.ServiceController~like-errorCallback Callback} will be called in case of any error while liking
   */
  like: function (objectId, successCallback, errorCallback) {
    var service = this,
      postLike = function (objectId, successCallback, errorCallback) {
        IN.API.Raw("/people/~/network/updates/key=" + objectId + "/is-liked")
          .method("PUT")
          .body("true")
          .result(function (result) {
            successCallback(result);
          })
          .error(function (error) {
            errorCallback(error);
          });
      },
      callback = (function (objectId, successCallback, errorCallback) {
        return function (isLoggedIn) {
          if (isLoggedIn) {
            postLike(objectId, successCallback, errorCallback);
          } else {
            service.startActionHandler(function () {
              postLike(objectId, successCallback, errorCallback);
            });
          }
        };
      })(objectId, successCallback, errorCallback);

    service.checkUserLoggedIn(callback);
  },
  /**
   * @method
   * @desc To undo a like( or unlike) on an object in LinkedIn through its API service
   * @param {String} objectId The object to dislike
   * @param {Callback} successCallback {@link  SBW.Controllers.Services.ServiceController~unlike-successCallback Callback} will be called if unlike is successful
   * @param {Callback} errorCallback {@link  SBW.Controllers.Services.ServiceController~unlike-errorCallback Callback} will be called in case of any error while un liking
   */
  unlike: function (objectId, successCallback, errorCallback) {
    var service = this,
      postLike = function (objectId, successCallback, errorCallback) {
        IN.API.Raw("/people/~/network/updates/key=" + objectId + "/is-liked")
          .method("PUT")
          .body("false")
          .result(function (result) {
            successCallback(result);
          })
          .error(function (error) {
            errorCallback(error);
          });
      },
      callback = (function (objectId, successCallback, errorCallback) {
        return function (isLoggedIn) {
          if (isLoggedIn) {
            postLike(objectId, successCallback, errorCallback);
          } else {
            service.startActionHandler(function () {
              postLike(objectId, successCallback, errorCallback);
            });
          }
        };
      })(objectId, successCallback, errorCallback);

    service.checkUserLoggedIn(callback);
  },

  /**
   * @method
   * @desc To share a url in LinkedIn through its API service
   * @param {String} url The url to be shared
   * @param  {Callback} successCallback {@link  SBW.Controllers.Services.ServiceController~share-successCallback Callback} will be called if successfully shared the link.
   * @param  {Callback} errorCallback {@link  SBW.Controllers.Services.ServiceController~share-errorCallback Callback} will be called if case of any error in sharing the link.
   */
  share: function (url, successCallback, errorCallback) {
    var service = this,
      shareLink = function (url, successCallback, errorCallback) {
        IN.UI.Share().params({
          url: url
        }).place();
      },
      callback = (function (url, successCallback, errorCallback) {
        return function (isLoggedIn) {
          if (isLoggedIn) {
            shareLink(url, successCallback, errorCallback);
          } else {
            service.startActionHandler(function () {
              shareLink(url, successCallback, errorCallback);
            });
          }
        };
      })(url, successCallback, errorCallback);

    service.checkUserLoggedIn(callback);
  },

  /**
   * @method
   * @desc To get share count for a url in LinkedIn through its API service
   * @param {String} url The url for which share count is required
   * @param  {Callback} successCallback {@link  SBW.Controllers.Services.ServiceController~getShareCount-successCallback Callback} will be called if the share count is fetched successfully.
   * @param  {Callback} errorCallback {@link  SBW.Controllers.Services.ServiceController~getShareCount-errorCallback Callback} will be called in case of any error while fetching share count.
   */
  getShareCount: function (url, successCallback, errorCallback) {
    var service = this;
    if (service.linkedInInit && IN.Tags) {
      var success = function (response) {
        successCallback({count: response});
      };
      IN.Tags.Share.getCount(url, success);
    } else {
      setTimeout(function () {
        service.getShareCount(url, successCallback, errorCallback);
      }, 1000);
    }
  },
  /**
   * @method
   * @desc To get comments posted on an object(post) of a LinkedIn user through its API service
   * @param  {Object} idObject the id  object, against which comments posted are to retrieved
   * @param {Callback} successCallback {@link  SBW.Controllers.Services.ServiceController~getComments-successCallback Callback} will be called if comments are fetched successfully
   * @param {Callback} errorCallback {@link  SBW.Controllers.Services.ServiceController~getComments-errorCallback Callback} will be called in case of any error while fetching comments
   */
  getComments: function (idObject, successCallback, errorCallback) {
    var service = this,
      comments = function (idObject, successCallback, errorCallback) {
        IN.API.Raw("/people/~/network/updates/key=" + idObject.assetId + "/update-comments")
          .result(function (result) {
            var commentsData = [], comments = result.values;
            for (var i = 0; i < comments.length; i++) {
              commentsData[i] = new SBW.Models.Comment({
                createdTime: comments[i].timestamp,
                fromUser: comments[i].person.firstName + ' ' + comments[i].person.lastName,
                likeCount: null,
                text: comments[i].comment,
                rawData: comments[i],
                serviceName: "linkedin",
                id: comments[i].id,
                userImage: comments[i].person.pictureUrl
              });
            }
            successCallback(commentsData);
          })
          .error(function (error) {
            var errorObject = new SBW.Models.Error({
              message: error.message,
              serviceName: 'linkedin',
              rawData: error,
              code: error.errorCode
            });
            errorCallback(errorObject);
          });
      },
      callback = (function (idObject, successCallback, errorCallback) {
        return function (isLoggedIn) {
          if (isLoggedIn) {
            comments(idObject, successCallback, errorCallback);
          } else {
            service.startActionHandler(function () {
              comments(idObject, successCallback, errorCallback);
            });
          }
        };
      })(idObject, successCallback, errorCallback);

    service.checkUserLoggedIn(callback);
  },
  /**
   * @method
   * @param  {String} url
   * @param  {Callback} successCallback  {@link  SBW.Controllers.Services.ServiceController~getCommentsForUrl-successCallback Callback} will be called if data is fetched successfully
   * @param  {Callback} errorCallback  {@link  SBW.Controllers.Services.ServiceController~getCommentsForUrl-errorCallback Callback} will be called in case of any error while fetching data
   * @ignore
   */
  getCommentsForUrl: function (url, successCallback, errorCallback) {
    //Implement it when Linked In supports comment  for URL
  },
  /**
   * @method
   * @desc To get likes on an object(post) of a LinkedIn user through its API service
   * @param  objectId the id of the object, against which likes posted are to retrieved
   * @param {Callback} successCallback {@link  SBW.Controllers.Services.ServiceController~getLikes-successCallback Callback} will be called if data is fetched successfully
   * @param {Callback} errorCallback {@link  SBW.Controllers.Services.ServiceController~getLikes-errorCallback Callback} will be called in case of any error while fetching data
   */
  getLikes: function (objectId, successCallback, errorCallback) {
    var service = this,
      likes = function (objectId, successCallback, errorCallback) {
        IN.API.Raw("/people/~/network/updates/key=" + objectId + "/likes")
          .result(function (response) {
            var likesData = [];
            var likes = response.values;
            for (var i = 0; i < likes.length; i++) {
              var user = new SBW.Models.User({
                name: likes[i].person.firstName + ' ' + likes[i].person.lastName,
                id: likes[i].person.id,
                userImage: likes[i].person.pictureUrl
              });
              likesData[i] = new SBW.Models.Like({
                user: user,
                rawData: likes[i]
              });
            }
            var likesObject = {
              serviceName: 'linkedin',
              likes: likesData,
              likeCount: likesData.length,
              rawData: response
            };
            // Todo Populating the asset object with the like and user objects
            successCallback(likesObject);
          })
          .error(function (error) {
            var errorObject = new SBW.Models.Error({
              message: error.message,
              serviceName: 'linkedin',
              rawData: error,
              code: error.errorCode
            });
            errorCallback(errorObject);
          });
      },
      callback = (function (objectId, successCallback, errorCallback) {
        return function (isLoggedIn) {
          if (isLoggedIn) {
            likes(objectId, successCallback, errorCallback);
          } else {
            service.startActionHandler(function () {
              likes(objectId, successCallback, errorCallback);
            });
          }
        };
      })(objectId, successCallback, errorCallback);

    service.checkUserLoggedIn(callback);
  },

  /**
   * @method
   * @desc To get updates from a LinkedIn user through its API service
   * @param {String} userId The Id of the user
   * @param {Callback} successCallback {@link  SBW.Controllers.Services.ServiceController~getPosts-successCallback Callback} will be called if data is fetched successfully
   * @param {Callback} errorCallback {@link  SBW.Controllers.Services.ServiceController~getPosts-errorCallback Callback} will be called in case of any error while fetching data
   */
  getPosts: function (userId, successCallback, errorCallback) {
    userId = userId || 'me';
    var service = this,
      updates = function (successCallback, errorCallback) {
        IN.API.MemberUpdates(userId)
          .result(function (result) {
            successCallback(result.values);
          })
          .error(function (error) {
            var errorObject = new SBW.Models.Error({
              message: error.message,
              serviceName: 'linkedin',
              rawData: error,
              code: error.errorCode
            });
            errorCallback(errorObject);
          });
      },
      callback = (function (successCallback, errorCallback) {
        return function (isLoggedIn) {
          if (isLoggedIn) {
            updates(successCallback, errorCallback);
          } else {
            service.startActionHandler(function () {
              updates(successCallback, errorCallback);
            });
          }
        };
      })(successCallback, errorCallback);

    service.checkUserLoggedIn(callback);
  },

  /**
   * @method
   * @desc To get Id of the recent post by the logged in user through its API service
   * @param {String} userId The Id of the user
   * @param {callback} successCallback - success callback will get called if data is fetched successfully
   * @param {callback} errorCallback - failure callback will get called in case of any error while fetching data
   */
  getRecentPostId: function (userId, successCallback, errorCallback) {
    userId = userId || 'me';
    var service = this,
      updates = function (successCallback, errorCallback) {
        IN.API.MemberUpdates(userId)
          .result(function (result) {
            successCallback(result.values[0].updateKey);
          })
          .error(function (error) {
            var errorObject = new SBW.Models.Error({
              message: error.message,
              serviceName: 'linkedin',
              rawData: error,
              code: error.errorCode
            });
            errorCallback(errorObject);
          });
      },
      callback = (function (successCallback, errorCallback) {
        return function (isLoggedIn) {
          if (isLoggedIn) {
            updates(successCallback, errorCallback);
          } else {
            service.startActionHandler(function () {
              updates(successCallback, errorCallback);
            });
          }
        };
      })(successCallback, errorCallback);
    service.checkUserLoggedIn(callback);
  },

  /**
   * @method
   * @desc To get connections of a LinkedIn user through its API service
   * @param {String} userId The Id of the user
   * @param {Callback} successCallback {@link  SBW.Controllers.Services.ServiceController~getFriends-successCallback Callback} will be called if data is fetched successfully
   * @param {Callback} errorCallback {@link  SBW.Controllers.Services.ServiceController~getFriends-errorCallback Callback} will be called in case of any error while fetching data
   */
  getFriends: function (userId, successCallback, errorCallback) {
    var service = this,
      connections = function (successCallback, errorCallback) {
        IN.API.Raw("people/~/connections")
          .result(function (result) {
            successCallback(JSON.stringify(result));
          })
          .error(function (error) {
            var errorObject = new SBW.Models.Error({
              message: error.message,
              serviceName: 'linkedin',
              rawData: error,
              code: error.errorCode
            });
            errorCallback(errorObject);
          });
      },
      callback = (function (successCallback, errorCallback) {
        return function (isLoggedIn) {
          if (isLoggedIn) {
            connections(successCallback, errorCallback);
          } else {
            service.startActionHandler(function () {
              connections(successCallback, errorCallback);
            });
          }
        };
      })(successCallback, errorCallback);
    service.checkUserLoggedIn(callback);
  },

  /**
   * @method
   * @desc To follow a company in LinkedIn through its API service
   * @param {string} companyId - Id of the company to be followed
   * @param {callback} successCallback - success callback will get called if data is fetched successfully
   * @param {callback} errorCallback - error callback will get called in case of any error while fetching data
   */
  follow: function (companyId, successCallback, errorCallback) {
    var service = this,
      connections = function (successCallback, errorCallback) {
        var url = '/people/~/following/companies', body = {"id": companyId}, unfollowFlag = false;
        IN.API.Raw()
          .url(url)
          .result(function (result) {
            if(result.values){
              result.values.forEach(function (value) {
              if (Number(companyId) === Number(value.id)) {
                unfollowFlag = true;
                IN.API.Raw()
                  .url(url + '/id=' + companyId)
                  .method('DELETE')
                  .result(function (result) {
                    setTimeout(function () {
                      successCallback(result);
                    }, 1000);
                  })
                  .error(function (error) {
                    errorCallback(error);
                  });
              }
            });
          }
            if (!unfollowFlag) {
              IN.API.Raw()
                .url(url)
                .method('POST')
                .body(JSON.stringify(body))
                .result(function (result) {
                  setTimeout(function () {
                    successCallback(result);
                  }, 1000);
                })
                .error(function (error) {
                  errorCallback(error);
                });
            }
          })
          .error(function (error) {
            errorCallback(error);
          });
      },
      callback = (function (successCallback, errorCallback) {
        return function (isLoggedIn) {
          if (isLoggedIn) {
            connections(successCallback, errorCallback);
          } else {
            service.startActionHandler(function () {
              connections(successCallback, errorCallback);
            });
          }
        };
      })(successCallback, errorCallback);
    service.checkUserLoggedIn(callback);
  },

  /**
   * @method
   * @desc To get follow count of a LinkedIn object/company through its API service
   * @param {string} companyId - Id of the company for which follow count is required
   * @param {callback} successCallback - success callback will get called if data is fetched successfully
   * @param {callback} errorCallback - error callback will get called in case of any error while fetching data
   */
  getFollowCount: function (companyId, successCallback, errorCallback) {
    var service = this,
      url = 'companies/' + companyId + ':(num-followers)';
    if (service.linkedInInit && IN.API) {
      IN.API.Raw()
        .url(url)
        .result(function (result) {
          successCallback({count: result.numFollowers, serviceName: 'linkedin'});
        })
        .error(function (error) {
          var errorObject = new SBW.Models.Error({
            message: error.message,
            serviceName: 'linkedin',
            rawData: error,
            code: error.errorCode
          });
          errorCallback(errorObject);
        });
    } else {
      setTimeout(function () {
        service.getFollowCount(companyId, successCallback, errorCallback);
      }, 1000);
    }
  },

  /**
   * @method
   * @desc To get recommend count from LinkedIn through its API service
   * @param {string} companyId - Id of the company for which recommend count is required
   * @param {callback} successCallback - success callback will get called if data is fetched successfully
   * @param {callback} errorCallback - error callback will get called in case of any error while fetching data
   */
  getRecommendCount: function (companyId, successCallback, errorCallback) {
    var service = this,
      body = {"id": companyId},
      url = '/companies/' + companyId + '/products:(id,name,type,num-recommendations,recommendations:(recommender))';
    if (service.linkedInInit && IN.API) {
      IN.API.Raw()
        .url(url)
        .result(function (result) {
          successCallback(result);
        })
        .error(function (error) {
          errorCallback(error);
        });
    } else {
      setTimeout(function () {
        service.getRecommendCount(companyId, successCallback, errorCallback);
      }, 1000);
    }
  },

  /**
   * @method
   * @desc To get profile data from a LinkedIn user through its API service
   * @param {String} userId The Id of the user
   * @param {callback} successCallback - success callback will get called if data is fetched successfully
   * @param {callback} errorCallback - error callback will get called in case of any error while fetching data
   */
  getProfile: function (userId, successCallback, errorCallback) {
    userId = userId || 'me';
    var service = this,
      profile = function (successCallback, errorCallback) {
        IN.API.Profile(userId)
          .fields(["id", "firstName", "lastName", "pictureUrl"])
          .result(function (result) {
            var profile = result.values[0];
            var profileData = {"id": profile.id, "name": profile.firstName + ' ' + profile.lastName, "photoUrl": profile.pictureUrl };
            successCallback(profileData);
          })
          .error(function (error) {
            var errorObject = new SBW.Models.Error({
              message: error.message,
              serviceName: 'linkedin',
              rawData: error,
              code: error.errorCode
            });
            errorCallback(errorObject);
          });
      },
      callback = (function (successCallback, errorCallback) {
        return function (isLoggedIn) {
          if (isLoggedIn) {
            profile(successCallback, errorCallback);
          } else {
            service.startActionHandler(function () {
              profile(successCallback, errorCallback);
            });
          }
        };
      })(successCallback, errorCallback);
    service.checkUserLoggedIn(callback);
  },

  /**
   * @method
   * @desc To get profile data from a LinkedIn user through its API service
   * @param {String} userId The Id of the user
   * @param {Callback} successCallback {@link  SBW.Controllers.Services.ServiceController~getProfilePic-successCallback Callback} will be called if data is fetched successfully
   * @param {Callback} errorCallback {@link  SBW.Controllers.Services.ServiceController~getProfilePic-errorCallback Callback} will be called in case of any error while fetching data
   */
  getProfilePic: function (userId, successCallback, errorCallback) {
    userId = userId || 'me';
    var service = this,
      profilePic = function (successCallback, errorCallback) {
        IN.API.Profile(userId)
          .fields(["pictureUrl"])
          .result(function (result) {
            var profile = result.values[0];
            successCallback(profile.pictureUrl);
          })
          .error(function (error) {
            var errorObject = new SBW.Models.Error({
              message: error.message,
              serviceName: 'linkedin',
              rawData: error,
              code: error.errorCode
            });
            errorCallback(errorObject);
          });
      },
      callback = (function (successCallback, errorCallback) {
        return function (isLoggedIn) {
          if (isLoggedIn) {
            profilePic(successCallback, errorCallback);
          } else {
            service.startActionHandler(function () {
              profilePic(successCallback, errorCallback);
            });
          }
        };
      })(successCallback, errorCallback);
    service.checkUserLoggedIn(callback);
  }
});
/**
 * @class  Picasa
 * @classdesc Picasa service implementation
 * @augments ServiceController
 * @constructor
 **/

SBW.Controllers.Services.Picasa = SBW.Controllers.Services.ServiceController.extend( /** @lends SBW.Controllers.Services.Picasa# */ {
  /** @constant */
  name: 'picasa',
  /** @constant */
  icon: 'picasa',
  /** @constant */
  title: 'Picasa',
  /**
   * @property {Array} content {@link SBW.Models.AssetCollection Asset Collections} container for picasa.
   */
  content: [],
  /** @property {Object} collectionSetRawData Holds raw data response of the collection set from picasa.
   *  @ignore
   */
  collectionSetRawData: null,
  /**
   * @method
   * @desc Initialize method to setup require items
   */
  init: function() {
    var clientID = SBW.Singletons.config.services.Picasa.clientID,
      callbackURL = SBW.Singletons.utils.callbackURLForService('Picasa');
    this.accessObject = {
      clientId: clientID,
      accessTokenUrl: 'https://accounts.google.com/o/oauth2/auth?client_id=' + clientID + '&scope=https://picasaweb.google.com/data&response_type=token&redirect_uri=' + callbackURL,
      access_token: null,
      apiKey: null
    };
    this.baseUrl = "https://picasaweb.google.com/data";
    this.feedUrl = this.baseUrl + "/feed/api/user/default";
    this.entryUrl = this.baseUrl + "/entry/api/user/default";
  },
  /**
   * @method
   * @desc Triggers authentication process to the picasa service.
   * @param {Callback} callback
   */
  startActionHandler: function(callback) {
    var service = this,
      accessTokenListner = function(windowRef) {
        if (!windowRef.closed) {
          if (service.getCookie('picasaToken')) {
            windowRef.close();
            service.getAccessToken.call(service, callback);
          } else {
            setTimeout(function() {
              accessTokenListner(windowRef);
            }, 2000);
          }
        }
      };
    if (service.authWindowReference === undefined || service.authWindowReference === null || service.authWindowReference.closed) {
      service.authWindowReference = window.open(service.accessObject.accessTokenUrl, 'picasa' + new Date().getTime(), service.getPopupWindowParams({
        height: 500,
        width: 400
      }));
      accessTokenListner(service.authWindowReference);
    } else {
      service.authWindowReference.focus();
    }
  },
  /**
   * @method
   * @desc Checks whether user is logged-in and has an authenticated session to service.
   * @param {Callback} callback Callback function to be called after checking login status
   */
  checkUserLoggedIn: function(callback) {
    var service = this,
      access_token = service.accessObject.access_token,
      url = "https://accounts.google.com/o/oauth2/tokeninfo?v=2.1&access_token=" + access_token;
    SBW.Singletons.utils.ajax({
      url: url,
      type: "GET",
      dataType: "jsonp"
    }, function(response) {
      if (response.error) {
        service.eraseCookie('picasaToken');
        callback(false);
      } else {
        callback(true);
      }
    }, function(response) {
      service.eraseCookie('picasaToken');
      callback(false);
    });
  },
  /**
   * @method
   * @desc Retrieves access tokens from cookie and sets it to accessObject
   * @param {Callback} callback callback function to be called after fetching access token
   */
  getAccessToken: function(callback) {
    var service = this,
      picasaCookie = service.getCookie('picasaToken');
    if (picasaCookie !== "undefined") {
      service.accessObject.access_token = picasaCookie;
      callback();
    }
  },


  /**
   * @method
   * @desc Utility method to create multipart/related request for posting images.
   * @param {String} title  Title of the image to post.
   * @param {String} description  Description about the image to post.
   * @param {File} image  Image file object.
   * @param {String} mimetype - Image file type.
   * @return {Binary} Buffer
   * @ignore
   */
  _generateMultipart: function(title, description, image, mimetype, isRaw) {
    if(!isRaw){
      image = new Uint8Array(image); // Wrap in view to get data
    }

    var before = ['Media multipart posting', "   \n", '--END_OF_PART', "\n", 'Content-Type: application/atom+xml', "\n", "\n", "<entry xmlns='http://www.w3.org/2005/Atom'>", '<title>', title, '</title>', '<summary>', description, '</summary>', '<category scheme="http://schemas.google.com/g/2005#kind" term="http://schemas.google.com/photos/2007#photo" />', '</entry>', "\n", '--END_OF_PART', "\n", 'Content-Type:', mimetype, "\n\n"].join(''),
      after = '\n--END_OF_PART--', imageSize = isRaw ? image.length : image.byteLength,
      size = before.length + imageSize + after.length,
      uint8array = new Uint8Array(size),
      i = 0,
      j = 0;

    // Append the string.
    for (i; i < before.length; i = i + 1) {
      uint8array[i] = before.charCodeAt(i) & 0xff;
    }

    // Append the binary data.
    for (j; j < imageSize; i = i + 1, j = j + 1) {
      uint8array[i] = isRaw ?  image.charCodeAt(j) : image[j];
    }

    // Append the remaining string
    for (j = 0; i < size; i = i + 1, j = j + 1) {
      uint8array[i] = after.charCodeAt(j) & 0xff;
    }

    return uint8array.buffer; // <-- This is an ArrayBuffer object!
  },

  /**
   * @method
   * @desc Fetches album details of the logged in user from picasa through picasa API service.
   * The method doesn't require any authentication.
   * @param {SBW.Controllers.Services.Picasa~getAlbums-successCallback} successCallback callback function to be called with the json response after successfully fetching the album details.
   * @param {SBW.Controllers.Services.Picasa~getAlbums-errorCallback} errorCallback callback function to be called in case of error while fetching the album details.
   */
  getAlbums: function(successCallback, errorCallback) {
    var service = this,
      getAlbumsCallback = function(successCallback, errorCallback) {
        var message = {
          action: service.feedUrl,
          method: "GET",
          parameters: {
            kind: 'album',
            access: 'all',
            alt: 'json',
            access_token: service.accessObject.access_token
          }
        },
        url = service.feedUrl + '?access_token=' + service.accessObject.access_token + '&alt=json';
        if (service.content.length > 0) {
          successCallback(service.content);
        } else {
          SBW.Singletons.utils.ajax({
            url: url,
            crossDomain: false,
            type: "GET",
            dataType: "jsonp"
          }, function(response) {
            var collection = null;
            service.content = [];
            response.feed.entry && $.each(response.feed.entry, function(key, value) {
              collection = new SBW.Models.AssetCollection({
                title: this.title.$t,
                createdTime: new Date().getTime(),
                status: this.gphoto$access.$t,
                serviceName: 'picasa',
                metadata: {
                  dateUpdated: new Date(this.updated.$t).toDateString(),
                  dateUploaded: new Date(this.published.$t).toDateString(),
                  numAssets: this.gphoto$numphotos.$t,
                  assetCollectionId: this.gphoto$id.$t,
                  commentCount: this.gphoto$commentCount.$t,
                  thumbnail: this.media$group.media$thumbnail[0].url || '',
                  fileName: this.gphoto$name.$t,
                  description: this.summary.$t,
                  author: this.author[0].name.$t
                }
              });
              collection.id = collection.getID();
              service.content.push(collection);
              service.collectionSetRawData = response;
            });
            successCallback(service.content);
          }, errorCallback);
        }
      },
      callback = (function(successCallback, errorCallback) {
        return function(isLoggedIn) {            
            getAlbumsCallback(successCallback, errorCallback);            
        };
      })(successCallback, errorCallback);

    service.startActionHandler(callback);
  },
  /**
   * Success Callback for getAlbums method.
   * @callback SBW.Controllers.Services.Picasa~getAlbums-successCallback
   * @param {Object} response JSON response from the service
   **/
  /**
   * Error Callback for getAlbums method.
   * @callback SBW.Controllers.Services.Picasa~getAlbums-errorCallback
   * @param {Object} response JSON response from the service
   **/

  /**
   * @method
   * @desc Upload photo to the user's dropbox album.
   * @param  {SBW.Models.UploadFileMetaData} mediaData Object containing media's file object and other metadata.
   * @param  {Callback} successCallback {@link SBW.Controllers.Services.ServiceController~uploadPhoto-successCallback Callback} to be executed on successful photo upload.
   * @param  {Callback} errorCallback {@link SBW.Controllers.Services.ServiceController~uploadPhoto-errorCallback Callback} to be executed on photo upload error.
   */
  uploadPhoto: function(mediaData, successCallback, errorCallback) {
    var service = this,
      mediaDataLength = mediaData.length,
      upload = function(mediaData, successCallback, errorCallback) {
        var feedUrl = service.feedUrl + '/albumid/default?access_token=' + service.accessObject.access_token + '&alt=json',
          url = SBW.Singletons.config.proxyURL + '?url=' + encodeURIComponent(feedUrl),
          uploadStatus = [];
        $.each(mediaData, function() {
          var filedata = this,
            reader = new FileReader();
          reader.onload = (function(mediaData) {
            return function(e) {
              SBW.Singletons.utils.ajax({
                url: url,
                data: service._generateMultipart(mediaData.title, mediaData.description, e.target.result, mediaData.file.type, false),
                contentType: 'multipart/related; boundary="END_OF_PART"',
                crossDomain: false,
                type: "POST",
                dataType: "json",
                processData: false
              }, function(response) {
                uploadStatus.push(new SBW.Models.UploadStatus({
                  serviceName: 'picasa',
                  id: response.entry.gphoto$id.$t,
                  rawData: response
                }));
                if (uploadStatus.length === mediaDataLength) {
                  successCallback(uploadStatus);
                }
              }, function() {
                uploadStatus.push(new SBW.Models.Error({
                  serviceName: 'picasa',
                  rawData: value
                }));
                if (uploadStatus.length === mediaData.length) {
                  errorCallback(uploadStatus);
                }
              });
            };
          })(filedata);

          // Read in the image file as a data URL.
          reader.readAsArrayBuffer(filedata.file);
        });
      },
      callback = (function(mediaData, successCallback, errorCallback) {
        return function(isLoggedIn) {
          if (isLoggedIn) {
            upload(mediaData, successCallback, errorCallback);
          } else {
            service.startActionHandler(function() {
              upload(mediaData, successCallback, errorCallback);
            });
          }
        };
      })(mediaData, successCallback, errorCallback);

    service.checkUserLoggedIn(callback);
  },
  /**
   * @method
   * @desc Upload video to the user's dropbox album.
   * @param  {SBW.Models.UploadFileMetaData} mediaData Object containing media's file object and other metadata.
   * @param  {Callback} successCallback {@link SBW.Controllers.Services.ServiceController~uploadVideo-successCallback Callback} to be executed on successful video upload.
   * @param  {Callback} errorCallback {@link SBW.Controllers.Services.ServiceController~uploadVideo-errorCallback Callback} to be executed on video upload error.
   */
  uploadVideo: function(mediaData, successCallback, errorCallback) {
    var service = this;
    service.uploadPhoto(mediaData, successCallback, errorCallback);
  },

  /**
   * @method
   * @desc formats media to SBW.ImageAsset
   * Formats the picasa response into SBW.ImageAsset.
   * @param  {Object}    response  json response received from picasa api.
   * @return {SBW.ImageAsset} SBW.ImageAsset
   * @ignore
   */
  _formatMedia: function(media) {
    var asset = new SBW.Models.ImageAsset({
      title: media.title.$t,
      createdTime: media.gphoto$timestamp.$t,
      rawData: media,
      serviceName: 'picasa',
      src: media.content.src,
      metadata: {
        dateUpdated: new Date(media.updated.$t).toDateString(),
        downloadUrl: media.content.src,
        dateUploaded: new Date(media.published.$t).toDateString(),
        size: media.gphoto$size.$t,
        assetId: media.gphoto$id.$t,
        assetCollectionId: media.gphoto$albumid.$t,
        height: media.gphoto$height.$t,
        width: media.gphoto$width.$t,
        commentCount: media.gphoto$commentCount.$t,
        originalFormat: media.content.type,
        version: media.gphoto$imageVersion.$t,
        description: media.summary.$t,
        author: media.media$group.media$credit[0].$t
      }
    });
    asset.id = asset.getID();
    return asset;
  },

  /**
   * @method
   * @desc Post comment on the photo referred by the given albumId and photoId.
   * @param  {String}   comment         Comment text to be posted.
   * @param  {Object}   idObject        Cotanins Asset Id and AssetCollection Id for the asset.
   * @param  {Callback} successCallback  {@link SBW.Controllers.Services.ServiceController~postComment-successCallback Callback} to be executed on successful comment posting.
   * @param  {Callback} errorCallback  {@link SBW.Controllers.Services.ServiceController~postComment-errorCallback Callback} to be executed on comment posting error.
   */
  postComment: function(idObject, comment, successCallback, errorCallback) {
    var service = this,
      postCommentCallback = function(comment, idObject, successCallback, errorCallback) {
        var feedUrl = service.feedUrl + '/albumid/' + idObject.assetCollectionId + '/photoid/' + idObject.assetId + '?access_token=' + service.accessObject.access_token + '&alt=json',
          url = SBW.Singletons.config.proxyURL + '?url=' + encodeURIComponent(feedUrl),
          data = "<?xml version='1.0' encoding='UTF-8'?> <entry xmlns='http://www.w3.org/2005/Atom'><content>" + comment + "</content><category scheme='http://schemas.google.com/g/2005#kind' term='http://schemas.google.com/photos/2007#comment' /></entry>";
        SBW.Singletons.utils.ajax({
          url: url,
          data: data,
          contentType: 'application/atom+xml',
          crossDomain: false,
          type: "POST",
          processData: false
        }, successCallback, errorCallback);
      },
      callback = (function(comment, idObject, successCallback, errorCallback) {
        return function(isLoggedIn) {
          if (isLoggedIn) {
            postCommentCallback(comment, idObject, successCallback, errorCallback);
          } else {
            service.startActionHandler(function() {
              postCommentCallback(comment, idObject, successCallback, errorCallback);
            });
          }
        };
      })(comment, idObject, successCallback, errorCallback);

    service.checkUserLoggedIn(callback);
  },

  /**
   * @method
   * @desc Fetch comments for the given photo from the given album
   * @param  {Object}   idObject        Cotanins Asset Id and AssetCollection Id for the asset.
   * @param {Callback} successCallback  {@link SBW.Controllers.Services.ServiceController~getComments-successCallback Callback} to be executed on successful comments retrieving.
   * @param {Callback} errorCallback  {@link SBW.Controllers.Services.ServiceController~getComments-errorCallback Callback} to be executed on retrieving comments error.
   */
  getComments: function(idObject, successCallback, errorCallback) {
    var service = this,
      getCommentsCallback = function(idObject, successCallback, errorCallback) {
        var url = service.feedUrl + '/albumid/' + idObject.assetCollectionId + '/photoid/' + idObject.assetId + '?access_token=' + service.accessObject.access_token + '&alt=json',
          cachedAsset = service.getAsset('picasa', idObject.assetCollectionId, idObject.assetId);
        if (cachedAsset === undefined || cachedAsset.metadata.comments === null || cachedAsset.metadata.comments === undefined) {
          SBW.Singletons.utils.ajax({
            url: url,
            crossDomain: false,
            type: "GET",
            dataType: "json"
          }, function(response) {
            var commentsArray = [];
            if (response.feed.entry) {
              $.each(response.feed.entry, function(key, value) {
                var comment = new SBW.Models.Comment();
                comment.text = value.content.$t;
                comment.createdTime = value.updated.$t;
                comment.fromUser = value.author[0].name.$t;
                comment.fromUserId = value.author[0].gphoto$user.$t;
                commentsArray.push(comment);
              });
              service._populateComments(idObject.assetCollectionId, idObject.assetId, commentsArray);
            }
            successCallback(commentsArray);
          }, errorCallback);
        } else {
          successCallback(cachedAsset.metadata.commentsArray);
        }
      },
      callback = (function(idObject, successCallback, errorCallback) {
        return function(isLoggedIn) {
          if (isLoggedIn) {
            getCommentsCallback(idObject, successCallback, errorCallback);
          } else {
            service.startActionHandler(function() {
              getCommentsCallback(idObject, successCallback, errorCallback);
            });
          }
        };
      })(idObject, successCallback, errorCallback);

    service.checkUserLoggedIn(callback);
  },

  /**
   * @method
   * @desc Fetch photo details from album
   * @param {String}   albumId          Album Id from which to fetch the photo details.
   * @param {SBW.Controllers.Services.Picasa~getPhotosFromAlbum-successCallback} successCallback  callback function to be called with json response after fetching the photo details successfully.
   * @param {SBW.Controllers.Services.Picasa~getPhotosFromAlbum-errorCallback} errorCallback  callback function to be called in case of error while fetching photo details.
   */
  getPhotosFromAlbum: function(albumId, successCallback, errorCallback) {
    var service = this,
      getPhotosFromAlbumCallback = function(albumId, successCallback, errorCallback) {
        var url = service.feedUrl + '/albumid/' + albumId + '?access_token=' + service.accessObject.access_token + '&alt=json',
          assetFound = false;
        service.content.forEach(function(collectionValue, collectionIndex, serviceContentArray) {
          if (collectionValue.metadata.assetCollectionId === albumId) {
            if (collectionValue.assets.length > 0) {
              successCallback(collectionValue.assets);
              assetFound = true;
            }
          }
        });
        if (!assetFound) {
          SBW.Singletons.utils.ajax({
            url: url,
            crossDomain: false,
            type: "GET",
            dataType: "json"
          }, function(response) {
            var photoArray = [];
            if (response.feed.entry) {
              $.each(response.feed.entry, function(key, value) {
                photoArray.push(service._formatMedia(value));
              });
              service._populateAssets(response.feed.gphoto$id.$t, photoArray);
            }
            successCallback(photoArray);
          }, errorCallback);
        }
      },
      callback = (function(albumId, successCallback, errorCallback) {
        return function(isLoggedIn) {
          if (isLoggedIn) {
            getPhotosFromAlbumCallback(albumId, successCallback, errorCallback);
          } else {
            service.startActionHandler(function() {
              getPhotosFromAlbumCallback(albumId, successCallback, errorCallback);
            });
          }
        };
      })(albumId, successCallback, errorCallback);

    service.checkUserLoggedIn(callback);
  },
  /**
   * Success Callback for getPhotosFromAlbum method.
   * @callback SBW.Controllers.Services.Picasa~getPhotosFromAlbum-successCallback
   * @param {Array} response Array of photos {@Link SBW.Models.ImageAsset} from the service
   **/
  /**
   * Error Callback for getPhotosFromAlbum method.
   * @callback SBW.Controllers.Services.Picasa~getPhotosFromAlbum-errorCallback
   * @param {Object} response JSON response from the service
   **/

  /**
   * @method
   * @desc Create a new album.
   * @param  {String}   title Title text of the album.
   * @param  {String}    description Description of the album.
   * @param  {SBW.Controllers.Services.Picasa~createAlbum-successCallback}  successCallback  callback function to be called with xml response after creating the album successfully.
   * @param  {SBW.Controllers.Services.Picasa~createAlbum-errorCallback}  errorCallback  callback function to be called in case of error while creating album.
   */
  createAlbum: function(title, description, successCallback, errorCallback) {
    var service = this,
      createAlbumCallback = function(title, description, successCallback, errorCallback) {
        var feedUrl = service.feedUrl + '?access_token=' + service.accessObject.access_token + '&alt=json',
          url = SBW.Singletons.config.proxyURL + '?url=' + encodeURIComponent(feedUrl),
          data = "<?xml version='1.0' encoding='UTF-8'?> <entry xmlns='http://www.w3.org/2005/Atom' xmlns:media='http://search.yahoo.com/mrss/' xmlns:gphoto='http://schemas.google.com/photos/2007'><title type='text'>" + title + "</title><summary type='text'>" + description + "</summary><category scheme='http://schemas.google.com/g/2005#kind' term='http://schemas.google.com/photos/2007#album' /></entry>";
        SBW.Singletons.utils.ajax({
          url: url,
          data: data,
          contentType: 'application/atom+xml',
          crossDomain: false,
          type: "POST"
        }, successCallback, errorCallback);
      },
      callback = (function(title, description, successCallback, errorCallback) {
        return function(isLoggedIn) {
          if (isLoggedIn) {
            createAlbumCallback(title, description, successCallback, errorCallback);
          } else {
            service.startActionHandler(function() {
              createAlbumCallback(title, description, successCallback, errorCallback);
            });
          }
        };
      })(title, description, successCallback, errorCallback);

    service.checkUserLoggedIn(callback);
  },
  /**
   * Success Callback for createAlbum method.
   * @callback SBW.Controllers.Services.Picasa~createAlbum-successCallback
   * @param {Object} response JSON response from the service
   **/
  /**
   * Error Callback for createAlbum method.
   * @callback SBW.Controllers.Services.Picasa~createAlbum-errorCallback
   * @param {Object} response JSON response from the service
   **/

  /**
   * @method
   * @desc  Delete an Album
   * @param {String}     albumId          Album Id of the album to delete.
   * @param  {SBW.Controllers.Services.Picasa~deleteAlbum-successCallback}  successCallback  callback function to be called after deleting the album successfully
   * @param  {SBW.Controllers.Services.Picasa~deleteAlbum-errorCallback}  errorCallback  callback function to be called in case of error while deleting the album.
   */
  deleteAlbum: function(albumId, successCallback, errorCallback) {
    var service = this,
      deleteAlbumCallback = function(albumId, successCallback, errorCallback) {
        var feedUrl = service.entryUrl + '/albumid/' + albumId + '?access_token=' + service.accessObject.access_token + '&alt=json',
          url = SBW.Singletons.config.proxyURL + '?url=' + encodeURIComponent(feedUrl);
        SBW.Singletons.utils.ajax({
          url: url,
          crossDomain: false,
          type: "DELETE",
          customHeaders: {
            "Gdata-Version": "2",
            "If-match": "*"
          }
        }, successCallback, errorCallback);
      },
      callback = (function(albumId, successCallback, errorCallback) {
        return function(isLoggedIn) {
          if (isLoggedIn) {
            deleteAlbumCallback(albumId, successCallback, errorCallback);
          } else {
            service.startActionHandler(function() {
              deleteAlbumCallback(albumId, successCallback, errorCallback);
            });
          }
        };
      })(albumId, successCallback, errorCallback);

    service.checkUserLoggedIn(callback);
  },
  /**
   * Success Callback for deleteAlbum method.
   * @callback SBW.Controllers.Services.Picasa~deleteAlbum-successCallback
   * @param {Object} response JSON response from the service
   **/
  /**
   * Error Callback for deleteAlbum method.
   * @callback SBW.Controllers.Services.Picasa~deleteAlbum-errorCallback
   * @param {Object} response JSON response from the service
   **/

  /**
   * @method
   * @desc Get profile picture of logged in user.
   * @param {Callback} successCallback  {@link SBW.Controllers.Services.ServiceController~getProfilePic-successCallback Callback} to be executed on successful profile picture retrieval.
   * @param {Callback} errorCallback  {@link SBW.Controllers.Services.ServiceController~getProfilePic-errorCallback Callback} to be executed on profile picture retrieving error.
   */
  getProfilePic: function(userId, successCallback, errorCallback) {
    var service = this,
      getProfilePicCallback = function(successCallback, errorCallback) {
        var responseFeed = service.collectionSetRawData.feed;
        if (responseFeed.gphoto$thumbnail.$t) {
          successCallback(responseFeed.gphoto$thumbnail.$t);
        } else {
          errorCallback();
        }
      };
    if (service.collectionSetRawData) {
      getProfilePicCallback(successCallback, errorCallback);
    } else {
      service.getAlbums(function(response) {
        getProfilePicCallback(successCallback, errorCallback);
      }, errorCallback);
    }
  },
  /**
   * @method
   * @desc Logs user out of service.
   * @param {Function} successCallback  Callback to be executed on successful logging out.
   * @param {Function} errorCallback  Callback to be executed on logging out error.
   */
  logout: function(successCallback, errorCallback) {
    var service = this;
    service.accessObject.token = null;
    service.eraseCookie('picasaToken');
    service.content = [];
    successCallback();
  },

    /**
     * @method
     * @desc uploads raw image     
     * @param {Array} mediaData array of image meta data objects
     * @param {Function} successCallback  Callback to be executed on successful logging out.
     * @param {Function} errorCallback  Callback to be executed on logging out error.
     */
    uploadRawImage: function(mediaData, successCallback,errorCallback){
      var service = this,
      mediaDataLength = mediaData.length,
      upload = function(mediaData, successCallback, errorCallback) {
        var feedUrl = service.feedUrl + '/albumid/default?access_token=' + service.accessObject.access_token + '&alt=json',
          url = SBW.Singletons.config.proxyURL + '?url=' + encodeURIComponent(feedUrl),
          uploadStatus = [];
          $.each(mediaData, function() {
              var filedata = this;
            var sendRequest = function(binarydata){
              SBW.Singletons.utils.ajax({
                url: url,
                data: service._generateMultipart(filedata.title, filedata.description, binarydata, "image/jpeg", true),
                contentType: 'multipart/related; boundary="END_OF_PART"',
                crossDomain: false,
                type: "POST",
                dataType: "json",
                processData: false
              }, function(response) {
                uploadStatus.push(new SBW.Models.UploadStatus({
                  serviceName: 'picasa',
                  id: response.entry.gphoto$id.$t,
                  rawData: response
                }));
                if (uploadStatus.length === mediaDataLength) {
                  successCallback(uploadStatus);
                }
              }, function(response) {
                uploadStatus.push(new SBW.Models.Error({
                  serviceName: 'picasa',
                  rawData: response
                }));
                if (uploadStatus.length === mediaData.length) {
                  errorCallback(uploadStatus);
                }
              }); };
            var imageUrl = SBW.Singletons.config.proxyURL + "?url=" + filedata.file;
              SBW.Singletons.utils.getRawImage(imageUrl,sendRequest);
          });
      },
      callback = (function(mediaData, successCallback, errorCallback) {
        return function(isLoggedIn) {
          if (isLoggedIn) {
            upload(mediaData, successCallback, errorCallback);
          } else {
            service.startActionHandler(function() {
              upload(mediaData, successCallback, errorCallback);
            });
          }
        };
      })(mediaData, successCallback, errorCallback);

    service.checkUserLoggedIn(callback);
    },   


  /**
   * @method
   * @desc Populate assets into asset collections.
   * @param {String} assetCollectionId Id of the asset collection
   * @param {Array} assets Array of {@link SBW.Models.Asset Assets}
   * @ignore
   */
  _populateAssets: function(assetcollectionId, assets) {
    var service = this;
    $.each(service.content, function() {
      if (this.metadata.assetCollectionId === assetcollectionId) {
        this.assets = assets;
        return false;
      }
    });
  },

  /**
   * @method
   * @desc Populate comments into asset.
   * @param {String} assetCollectionId Id of the asset collection
   * @param {String} assetId Id of the asset
   * @param {Array} comments Array of {@link SBW.Models.Comment Comments}
   * @ignore
   */
  _populateComments: function(assetcollectionId, assetId, comments) {
    var service = this;
    service.content.forEach(function(collectionValue, collectionIndex, serviceContentArray) {
      if (collectionValue.metadata.assetCollectionId === assetcollectionId) {
        collectionValue.assets.forEach(function(assetValue, assetIndex, assetArray) {
          if (assetValue.metadata.assetId === assetId) {
            assetValue.metadata.comments = comments;
            return assetValue;
          }
        });
      }
    });
  }
});
/**
 * @class  Twitter
 * @classdesc This is Twitter service implementation
 * @augments ServiceController
 * @constructor
 **/

SBW.Controllers.Services.Twitter = SBW.Controllers.Services.ServiceController.extend(/** @lends SBW.Controllers.Services.Twitter# */ {
  /**
   * @constant
   * @type {string}
   * @desc The service name
   **/
  name: 'twitter',
  /**
   * @constant
   * @type {string}
   * @desc The service icon
   **/
  icon: 'twitter',
  /**
   * @constant
   * @type {string}
   * @desc The service title
   **/
  title: 'Twitter',
  /**
   * @method
   * @desc initialize method to setup required urls and objects.
   */
  init: function () {
    this.callbackUrl = SBW.Singletons.utils.callbackURLForService('twitter');
    this.proxyUrl = SBW.Singletons.config.proxyURL;
    this.apiVersionUrl = "https://api.twitter.com/1.1";
    this.postUrl = this.apiVersionUrl + "/statuses/update.json";
    this.shareUrl = this.apiVersionUrl + "/statuses/retweet/";
    this.homeTimelineUrl = this.apiVersionUrl + "/statuses/home_timeline.json";
    this.mentionsTimelineUrl = this.apiVersionUrl + "/statuses/mentions_timeline.json";
    this.apiSearchUrl = this.apiVersionUrl + "/search/tweets.json";
    this.userTimelineUrl = this.apiVersionUrl + "/statuses/user_timeline.json";
    this.accountSettingsUrl = this.apiVersionUrl + "/account/settings.json";
    this.profileUrl = this.apiVersionUrl + "/users/show.json";
    this.countUrl = "http://cdn.api.twitter.com/1/urls/count.json";
    this.followUrl = this.apiVersionUrl + "/friendships/create.json";
    this.unfollowUrl = this.apiVersionUrl + "/friendships/destroy.json";
    this.followStatusUrl = this.apiVersionUrl + "/friendships/show.json";
    this.likeUrl = this.apiVersionUrl + "/favorites/create.json";
    this.unlikeUrl = this.apiVersionUrl + "/favorites/destroy.json";
    this.requestTokenUrl = "http://api.twitter.com/oauth/request_token";
    this.authorizeUrl = "http://api.twitter.com/oauth/authorize";
    this.accessTokenUrl = "http://api.twitter.com/oauth/access_token";
    this.getPostUrl = "https://api.twitter.com/1.1/statuses/show/";
    this.accessObject = {
      consumerKey: SBW.Singletons.config.services.Twitter.consumerKey,
      consumerSecret: SBW.Singletons.config.services.Twitter.consumerSecret,
      user_id: null
    };
    this.user = new SBW.Models.User({});
  },
  /**
   * @method
   * @desc Triggers authentication process for the twitter service.
   * @param {callback} callback
   */
  startActionHandler: function (callback) {
    var service = this;
    service.eraseCookie('twitterToken');
    var tokenListener = function (windowReference) {
      if (!windowReference.closed) {
        if (service.getCookie('twitterToken')) {
          windowReference.close();
          service.getAccessToken.call(service, callback);
        } else {
          setTimeout(function () {
            tokenListener(windowReference);
          }, 2000);
        }
      } else {
        service.isUserLoggingIn = false;
      }
    };
    if (service.authWindowReference === null || service.authWindowReference.closed || service.authWindowReference === undefined) {
      service.authWindowReference = window.open('', 'Twitter' + new Date().getTime(), service.getPopupWindowParams({
        height: 500,
        width: 400
      }));
      service.authWindowReference.document.write("redirecting to Twitter");
      /*The reference window is bounded with beforeunload event to see if the popup is closed using the window close button*/
      $(service.authWindowReference).bind("beforeunload", function (e) {
        var _window = this;
        setTimeout(function () {
          if (_window.closed) {
            service.isUserLoggingIn = false;
          }
        }, 500);
      });
      var message = {
        action: this.requestTokenUrl,
        method: "GET",
        parameters: {
          oauth_callback: service.callbackUrl
        }
      };
      service.accessObject.access_token = null;
      service.accessObject.tokenSecret = null;
      var url = service.signAndReturnUrl(this.requestTokenUrl, message);
      this.sendTwitterRequest({
        url: url,
        returnType: 'text'
      }, function (response) {
        var respJson = SBW.Singletons.utils.getJSONFromQueryParams(response);
        service.accessObject.access_token = respJson.oauth_token;
        service.accessObject.tokenSecret = respJson.oauth_token_secret;
        service.authWindowReference.document.location.href = service.authorizeUrl + "?oauth_token=" + service.accessObject.access_token + "&perms=write";
        tokenListener(service.authWindowReference);
      }, function (response) {
        console.log('Error: ', response);
      });
    } else {
      service.authWindowReference.focus();
    }
  },
  /**
   * @method
   * @desc Function to check if the user is logged in.
   * @param {callback} callback
   */
  checkUserLoggedIn: function (callback) {
    if (this.accessObject.tokenSecret && this.accessObject.access_token && this.isUserLoggingIn) {
      callback(true);
    } else {
      callback(false);
    }
  },
  /**
   * @method.
   * @desc Method to generate the oauth_signature for a request and append oauth tokens as querystring parameters.
   * @param {String} link The url link to be signed.
   * @param {Object} msg An object that contains information about the request such as request type, url and parameters.
   * @returns {String} signed url containing the oauth signature and tokens as querystring parameters.
   */
  signAndReturnUrl: function (link, msg) {
    var service = this;
    OAuth.completeRequest(msg, service.accessObject);
    OAuth.SignatureMethod.sign(msg, service.accessObject);
    link = link + '?' + OAuth.formEncode(msg.parameters);
    return link;
  },
  /**
   * @method
   * @desc Sends request for fetching the access tokens for a user and sets them in the Twitter service access object,
   * @param {callback} callback - callback function to be called after fetching the access token.
   */
  getAccessToken: function (callback) {
    var service = this,
      twitterVerifier = service.getCookie('twitterToken');
    if (twitterVerifier) {
      var message = {
        action: this.accessTokenUrl,
        method: "GET",
        parameters: {
          oauth_token: service.accessObject.access_token,
          oauth_verifier: twitterVerifier
        }
      },
        url = service.signAndReturnUrl(this.accessTokenUrl, message);
      this.sendTwitterRequest({
        url: url,
        returnType: 'text'
      }, function (response) {
        var jsonResp = SBW.Singletons.utils.getJSONFromQueryParams(response);
        service.accessObject.user_id = jsonResp.user_id;
        service.accessObject.access_token = jsonResp.oauth_token;
        service.accessObject.tokenSecret = jsonResp.oauth_token_secret;
        service.user.id = jsonResp.user_id;
        service.user.screenName = jsonResp.screen_name;
        service.isUserLoggingIn = true;
        if (service.user.id !== undefined) {
          callback();
        }
      }, function (response) {
        console.log('Error: ', response);
      });
    } else {
      console.log("error in getting access token");
    }
  },
  /**
   * @method
   * @desc Function to reset the access object of twitter service on logout.
   * @param {callback} callback
   */
  logoutHandler: function (callback) {
    var service = this;
    service.accessObject.access_token = null;
    service.accessObject.nsid = null;
  },
  /**
   * @method
   * @desc Function to send a request to the proxy.
   * @param {Object} data An object that contains the request url, parameters, type and headers.
   * @param {callback} successCallback Function to be executed in case of success response from twitter.
   * @param {callback} errorCallback Function to be executed in case of error response from twitter.
   */
  sendTwitterRequest: function (data, successCallback, errorCallback) {
    var service = this, index, headerLength, header, headers = {}, options;
    if (data.header) {
      headerLength = data.header.length;
      for (index = 0; index < headerLength; index++) {
        header = data.header[index].split(':');
        if (header.length === 2) {
          headers[header[0]] = header[1];
        }
      }
    }
    options = {
      url: service.proxyUrl + '?url=' + encodeURIComponent(data.url),
      type: (data.type || 'GET'),
      data: data.parameters || '',
      customHeaders: headers,
      contentType: data.contentType,
      processData: data.processData,
      dataType: data.returnType || 'json'
    };
    SBW.Singletons.utils.ajax(options, successCallback, errorCallback);
  },
  /**
   * @method
   * @desc Function to create the twitter authorization header.
   * @param {Object} message An object that contains the request url, parameters and request type.
   * @return {String} The authorization header as a string.
   */
  getAuthorizationHeader: function (message) {
    var service = this;
    var parameters = message.parameters;
    parameters.push(['oauth_consumer_key', service.accessObject.consumerKey]);
    parameters.push(['oauth_nonce', OAuth.nonce(32)]);
    parameters.push(['oauth_signature_method', "HMAC-SHA1"]);
    parameters.push(['oauth_timestamp', OAuth.timestamp()]);
    parameters.push(['oauth_token', service.accessObject.access_token]);
    parameters.push(['oauth_version', "1.0"]);

    var accessor = {
      consumerSecret: service.accessObject.consumerSecret,
      tokenSecret: service.accessObject.tokenSecret
    };

    OAuth.SignatureMethod.sign(message, accessor);
    var normalizedParameters = OAuth.SignatureMethod.normalizeParameters(message.parameters),
      signatureBaseString = OAuth.SignatureMethod.getBaseString(message),
      signature = OAuth.getParameter(message.parameters, "oauth_signature"),
      authorizationHeader = OAuth.getAuthorizationHeader("", message.parameters);

    return 'Authorization: ' + authorizationHeader;
  },
  /**
   * @method
   * @desc Function to create an object containing the request url, type, parameters and headers.
   * @param {String} url The request url.
   * @param {Object} parameters The request parameters.
   * @param {String} type The request type.
   * @return {Object} An object containing the request url, type, parameters and headers..
   */
  getDataForRequest: function (url, parameters, type) {
    var requestParameters = [], key;
    if (parameters) {
      for (key in parameters) {
        if (parameters.hasOwnProperty(key)) {
          requestParameters.push([key, parameters[key]]);
        }
      }
    }
    var message = {
        action: url,
        method: type,
        parameters: requestParameters
      },
      authorizationHeader = this.getAuthorizationHeader(message);
    return {
      url: url + ((type === "GET") ? ('?' + OAuth.formEncode(parameters)) : ''),
      type: type,
      header: [authorizationHeader],
      parameters: ((type === "GET") ? '' : parameters)
    };
  },
  /**
   * @method
   * @desc Function to get the home time line for a user.
   * @param {Object} parameters An object that contains the parameters for the request.
   * @example parameter object
      {
        count:12           optional
        since_id:12345     optional
        max_id:12345       optional
        contributor_details:true optional
      }
      there are many other optional parameters to filter the search results
   * @param {callback} successCallback Function to be executed in case of success response from twitter.
   * @param {callback} errorCallback Function to be executed in case of error response from twitter.
   */
  getHomeTimeLine: function (parameters, successCallback, errorCallback) {
    var service = this, data,
      getTimeLine = function (parameters, successCallback, errorCallback) {
        data = service.getDataForRequest(service.homeTimelineUrl, parameters, 'GET');
        service.sendTwitterRequest(data, successCallback, errorCallback);
      },
      callback = (function (parameters, successCallback, errorCallback) {
        return function (isLoggedIn) {
          if (isLoggedIn) {
            getTimeLine(parameters, successCallback, errorCallback);
          } else {
            service.startActionHandler(function () {
              getTimeLine(parameters, successCallback, errorCallback);
            });
          }
        };
      })(parameters, successCallback, errorCallback);
    service.checkUserLoggedIn(callback);
  },
  /**
   * @method
   * @desc Function to get the mentions time line for a user.
   * @param {Object} parameters An object that contains the parameters for the request.
   * @example parameter object
     {
       count:12           optional
       since_id:12345     optional
       max_id:12345       optional
       contributor_details:true optional
     }
     there are many other optional parameters to filter the search results
   * @param {callback} successCallback Function to be executed in case of success response from twitter.
   * @param {callback} errorCallback Function to be executed in case of error response from twitter.
   */
  getMentionsTimeLine: function (parameters, successCallback, errorCallback) {
    var service = this, data,
      getTimeLine = function (parameters, successCallback, errorCallback) {
        data = service.getDataForRequest(service.mentionsTimelineUrl, parameters, 'GET');
        service.sendTwitterRequest(data, successCallback, errorCallback);
      },
      callback = (function (parameters, successCallback, errorCallback) {
        return function (isLoggedIn) {
          if (isLoggedIn) {
            getTimeLine(parameters, successCallback, errorCallback);
          } else {
            service.startActionHandler(function () {
              getTimeLine(parameters, successCallback, errorCallback);
            });
          }
        };
      })(parameters, successCallback, errorCallback);
    service.checkUserLoggedIn(callback);
  },
  /**
   * @method
   * @desc Function to search twitter for a particular search string. No authentication is required for this request.
   * api deprecated by twitter
   * @param {Object} parameters An object that contains the parameters for the request.
   * @example parameter object
     { q:socialbyway+imaginea   required
       result_type:recent       optional
       show_user:true           optional
       until:2013-03-28         optional
     }
     there are many other optional parameters to filter the search results
   * @param {callback} successCallback Function to be executed in case of success response from twitter.
   * @param {callback} errorCallback Function to be executed in case of error response from twitter.
   */
  searchTweets: function (parameters, successCallback, errorCallback) {
    var key, queryString = '';
    if (parameters) {
      for (key in parameters) {
        if (parameters.hasOwnProperty(key)) {
          parameters[key] = encodeURIComponent(parameters[key]);
          queryString += key + '=' + parameters[key] + '&';
        }
      }
      queryString = queryString.slice(0, queryString.lastIndexOf('&'));
    }
    var data = {
      url: 'https://search.twitter.com/search.json' + '?' + queryString,
      type: 'GET',
      header: '',
      parameters: ''
    };
    this.sendTwitterRequest(data, successCallback, errorCallback);
  },
  /**
   * @method
   * @desc Function to search twitter for a particular search string. User authentication is required for this request.
   * @param {Object} parameters An object that contains the parameters for the request.
   * @param {callback} successCallback Function to be executed in case of success response from twitter.
   * @param {callback} errorCallback Function to be executed in case of error response from twitter.
   */
  search: function (parameters, successCallback, errorCallback) {
    var service = this, data,
      searchTweets = function (parameters, successCallback, errorCallback) {
        data = service.getDataForRequest(service.apiSearchUrl, parameters, 'GET');
        service.sendTwitterRequest(data, successCallback, errorCallback);
      },
      callback = (function (parameters, successCallback, errorCallback) {
        return function (isLoggedIn) {
          if (isLoggedIn) {
            searchTweets(parameters, successCallback, errorCallback);
          } else {
            service.startActionHandler(function () {
              searchTweets(parameters, successCallback, errorCallback);
            });
          }
        };
      })(parameters, successCallback, errorCallback);
    service.checkUserLoggedIn(callback);
  },
  /**
   * @method
   * @desc Function to get the users timeline.
   * @param {Object} parameters An object that contains the parameters for the request.
   * @example parameter object
     {
       user_id:12345              optional
       screen_name:'socialbyway'  optional
       count:20                   optional
       since_id:12345             optional
       max_id:12345               optional
       contributor_details:true   optional
     }
   * @param {callback} successCallback Function to be executed in case of success response from twitter.
   * @param {callback} errorCallback Function to be executed in case of error response from twitter.
   */
  getUserTimeline: function (parameters, successCallback, errorCallback) {
    var service = this, data,
      getTimeLine = function (parameters, successCallback, errorCallback) {
        data = service.getDataForRequest(service.userTimelineUrl, parameters, 'GET');
        service.sendTwitterRequest(data, successCallback, errorCallback);
      },
      callback = (function (parameters, successCallback, errorCallback) {
        return function (isLoggedIn) {
          if (isLoggedIn) {
            getTimeLine(parameters, successCallback, errorCallback);
          } else {
            service.startActionHandler(function () {
              getTimeLine(parameters, successCallback, errorCallback);
            });
          }
        };
      })(parameters, successCallback, errorCallback);
    service.checkUserLoggedIn(callback);
  },
  /**
   * @method
   * @desc Function to get the logged in user's account settings.
   * @param {callback} successCallback Function to be executed in case of success response from twitter.
   * @param {callback} errorCallback Function to be executed in case of error response from twitter.
   */
  getAccountSettings: function (successCallback, errorCallback) {
    var service = this, data,
      getSettings = function (successCallback, errorCallback) {
        data = service.getDataForRequest(service.accountSettingsUrl, null, 'GET');
        service.sendTwitterRequest(data, successCallback, errorCallback);
      },
      callback = (function (successCallback, errorCallback) {
        return function (isLoggedIn) {
          if (isLoggedIn) {
            getSettings(successCallback, errorCallback);
          } else {
            service.startActionHandler(function () {
              getSettings(successCallback, errorCallback);
            });
          }
        };
      })(successCallback, errorCallback);
    service.checkUserLoggedIn(callback);
  },
  /**
   * @method
   * @desc Function to post a string on twitter.
   * @param {String} message The string that has to be posted on twitter.
   * @param {callback} successCallback Function to be executed in case of success response from twitter.
   * @param {callback} errorCallback Function to be executed in case of error response from twitter.
   */
  publishMessage: function (message, successCallback, errorCallback) {
    var service = this,
      requestParameters = {
        status: message
      },
      publishMessageCallback = function (requestParameters, successCallback, errorCallback) {
        var data = service.getDataForRequest(service.postUrl, requestParameters, 'POST');
        service.sendTwitterRequest(data, function (jsonResponse) {
          successCallback({
            id: jsonResponse.id,
            serviceName: "twitter"
          }, jsonResponse);
        }, function (response) {
          var errorObject = new SBW.Models.Error();
          errorObject.message = JSON.parse(response.responseText).errors[0].message;
          errorObject.code = JSON.parse(response.responseText).errors[0].code;
          errorObject.serviceName = 'twitter';
          errorObject.rawData = JSON.parse(response.responseText);
          errorCallback(errorObject);
        });
      },
      callback = (function (requestParameters, successCallback, errorCallback) {
        return function (isLoggedIn) {
          if (isLoggedIn) {
            publishMessageCallback(requestParameters, successCallback, errorCallback);
          } else {
            service.startActionHandler(function () {
              publishMessageCallback(requestParameters, successCallback, errorCallback);
            });
          }
        };
      })(requestParameters, successCallback, errorCallback);
    service.checkUserLoggedIn(callback);
  },
  /**
   * implement it when twitter supports get favorites count for a tweet
   * @method
   * @desc Function to get a post corresponding to an id.
   * @param {String} objectId Id of the object.
   * @param {callback} successCallback Function to be executed in case of success response from twitter.
   * @param {callback} errorCallback Function to be executed in case of error response from twitter.
   */
  getLikes: function (objectId, successCallback, errorCallback) {
    var likesObject = {
      serviceName: 'twitter',
      likes: null,
      likeCount: null,
      message: undefined,
      rawData: ''
    };
    successCallback(likesObject);
  },
  /**
   * @method
   * @desc Function to get a post corresponding to an id.
   * @param {Object} parameters An object that contains the parameters for the request.
   * @param {callback} successCallback Function to be executed in case of success response from twitter.
   * @param {callback} errorCallback Function to be executed in case of error response from twitter.
   */
  getPost: function (parameters, successCallback, errorCallback) {
    if (parameters.id) {
      var data = this.getDataForRequest(this.getPostUrl + parameters.id + '.json', parameters, 'GET');
      this.sendTwitterRequest(data, successCallback, errorCallback);
    } else {
      errorCallback(null);
    }
    // todo authentication required
  },
  /**
   * @method
   * @desc Function to post a tweet with an image on twitter.
   * @param {Array} parameterArray An array that contains the parameters for the request.
   * @param {callback} successCallback Function to be executed in case of success response from twitter.
   * @param {callback} errorCallback Function to be executed in case of error response from twitter.
   */
  updateWithMedia: function (parameterArray, successCallback, errorCallback) {
    var service = this, requestParameters = [];
    parameterArray.forEach(function (parameters) {
      var formData = new FormData(),
        key,
        file = parameters.file,
        fileData = {};
      formData.append('media[]', file);
      fileData.status = parameters.title + ' - ' + parameters.description;
      for (key in fileData) {
        if (fileData.hasOwnProperty(key)) {
          requestParameters.push([key, fileData[key]]);
          formData.append(key, fileData[key]);
        }
      }
      var message = {
          action: 'https://api.twitter.com/1.1/statuses/update_with_media.json',
          method: "POST",
          parameters: requestParameters
        },
        authorizationHeader = service.getAuthorizationHeader(message),
        queryString = OAuth.formEncode(fileData),
        data = {
          url: 'https://api.twitter.com/1.1/statuses/update_with_media.json?' + queryString,
          header: [authorizationHeader],
          type: 'POST',
          parameters: formData,
          processData: false,
          contentType: false
        },
        success = function (jsonResponse) {
          var uploadStatus = [];
          uploadStatus.push(new SBW.Models.UploadStatus({
            id: jsonResponse.id,
            serviceName: 'twitter',
            status: 'success',
            rawData: jsonResponse
          }));
          successCallback(uploadStatus);
        };
      service.sendTwitterRequest(data, success, errorCallback);
    });
  },
  /**
   * @method
   * @desc Function to post a tweet with an image on twitter.
   * @param {Array} parameterArray An array that contains the parameters for the request.
   * @param {callback} successCallback Function to be executed in case of success response from twitter.
   * @param {callback} errorCallback Function to be executed in case of error response from twitter.
   */
  uploadPhoto: function (parameterArray, successCallback, errorCallback) {
    this.updateWithMedia(parameterArray, successCallback, errorCallback);
  },
  /**
   * @method
   * @desc Function to get the profile picture of the logged in user.
   * @param {String} userId The twitter user id of the user.
   * @param {callback} successCallback Function to be executed in case of success response from twitter.
   * @param {callback} errorCallback Function to be executed in case of error response from twitter.
   */
  getProfilePic: function (userId, successCallback, errorCallback) {
    var service = this,
      parameters = {};
    if (service.user.userImage) {
      successCallback(service.user.userImage);
    } else {
      if (userId) {
        parameters['user_id'] = userId;
      } else {
        if (service.user.id) {
          parameters['user_id'] = service.user.id;
        } else if (service.user.screenName) {
          parameters['screen_name'] = service.user.screenName;
        }
      }
      service.getProfile(parameters, function () {
        successCallback(service.user.userImage);
      }, errorCallback);
    }
  },
  /**
   * @method
   * @desc Function to get the user profile information.
   * @param {Object} parameters An object that contains the parameters for the request.
   * @example parameter object
       {
         user_id:12345              optional
         screen_name:'socialbyway'  optional
         include_entities:false     optional
       }
   * @param {callback} successCallback Function to be executed in case of success response from twitter.
   * @param {callback} errorCallback Function to be executed in case of error response from twitter.
   */
  getProfile: function (parameters, successCallback, errorCallback) {
    var service = this, data;
    if (service.user.id && service.user.name && service.user.screenName && service.user.userImage) {
      successCallback(service.user);
    } else {
      var getProfileData = function (parameters, successCallback, errorCallback) {
          data = service.getDataForRequest(service.profileUrl, parameters, 'GET');
          service.sendTwitterRequest(data, function (jsonResponse) {
            service.user.id = jsonResponse.id;
            service.user.name = jsonResponse.name;
            service.user.screenName = jsonResponse.screen_name;
            service.user.userImage = jsonResponse.profile_image_url;
            successCallback(jsonResponse);
          }, errorCallback);
        },
        callback = (function (parameters, successCallback, errorCallback) {
          return function (isLoggedIn) {
            if (isLoggedIn) {
              getProfileData(parameters, successCallback, errorCallback);
            } else {
              service.startActionHandler(function () {
                getProfileData(parameters, successCallback, errorCallback);
              });
            }
          };
        })(parameters, successCallback, errorCallback);
      service.checkUserLoggedIn(callback);
    }
  },
  /**
   * @method
   * @desc Function to follow the user given his screen name.
   * @param {String} name The twitter user to follow..
   * @param {callback} successCallback Function to be executed in case of success response from twitter.
   * @param {callback} errorCallback Function to be executed in case of error response from twitter.
   */
  follow: function (name, successCallback, errorCallback) {
    var service = this;
    service.checkFollowStatus(name, function (isFollowing) {
      if (isFollowing === true) {
        service.unSubscribe({
          screen_name: name
        }, successCallback, function (error) {
          errorCallback(new SBW.Models.Error({
            serviceName: 'twitter'
          }));
        });
      } else {
        service.subscribe({
          screen_name: name
        }, successCallback, function (error) {
          errorCallback(new SBW.Models.Error({
            serviceName: 'twitter'
          }));
        });
      }
    }, function (error) {
      SBW.logger.error("In checkFollowStatus method - Twitter");
    });
  },
  /**
   * @method
   * @desc Checks if the logged in user follows the given target user.
   * @param {String} targetScreenName Screen name of the user to check follow status.
   * @param {callback} successCallback Function to be executed in case of success response from twitter.
   * @param {callback} errorCallback Function to be executed in case of error response from twitter.
   * @ignore
   */
  checkFollowStatus: function (targetScreenName, successCallback, errorCallback) {
    var service = this,
      data,
      checkFollowStatusCallback = function (targetScreenName, successCallback, errorCallback) {
        data = service.getDataForRequest(service.followStatusUrl, {
          source_screen_name: service.user.screenName,
          target_screen_name: targetScreenName
        }, 'GET');
        service.sendTwitterRequest(data, function (response) {
          successCallback(response.relationship.target.followed_by);
        }, function (error) {
          errorCallback(new SBW.Models.Error({
            serviceName: 'twitter'
          }));
        });
      },
      callback = (function (targetScreenName, successCallback, errorCallback) {
        return function (isLoggedIn) {
          if (isLoggedIn) {
            checkFollowStatusCallback(targetScreenName, successCallback, errorCallback);
          } else {
            service.startActionHandler(function () {
              checkFollowStatusCallback(targetScreenName, successCallback, errorCallback);
            });
          }
        };
      })(targetScreenName, successCallback, errorCallback);
    service.checkUserLoggedIn(callback);
  },
  /**
   * @method
   * @desc Function to get the followers count of a user.
   * @param {String} name The twitter screen name of the user.
   * @param {callback} successCallback Function to be executed in case of success response from twitter. Contains a count object as parameter.
   * @param {callback} errorCallback Function to be executed in case of error response from twitter.
   */
  getFollowCount: function (name, successCallback, errorCallback) {
    var service = this,
      getFollowCountCallback = function (name, successCallback, errorCallback) {
        var data = service.getDataForRequest(service.profileUrl, {
          screen_name: name
        }, 'GET');
        service.sendTwitterRequest(data, function (response) {
          successCallback({
            count: response['followers_count'],
            serviceName: 'twitter'
          });
        }, function (error) {
          errorCallback(new SBW.Models.Error({
            serviceName: 'twitter'
          }));
        });
      },
      callback = (function (name, successCallback, errorCallback) {
        return function (isLoggedIn) {
          if (isLoggedIn) {
            getFollowCountCallback(name, successCallback, errorCallback);
          } else {
            service.startActionHandler(function () {
              getFollowCountCallback(name, successCallback, errorCallback);
            });
          }
        };
      })(name, successCallback, errorCallback);
    service.checkUserLoggedIn(callback);
  },
  /**
   * @method
   * @desc Function to get the Share count of a url.
   * @param {String} url The url for which share count has to be obtained.
   * @param {callback} successCallback Function to be executed in case of success response from twitter. Contains a count object as parameter.
   * @param {callback} errorCallback Function to be executed in case of error response from twitter.
   */
  getShareCount: function (url, successCallback, errorCallback) {
    var data = {
      url: this.countUrl + ('?' + OAuth.formEncode({ url: url })),
      type: 'GET',
      header: [],
      parameters: ''
    };
    this.sendTwitterRequest(data, successCallback, errorCallback);
  },
  /**
   * @method
   * @desc Function to get the tweet count of a particular url.
   * @param {Object} parameters An object that contains the parameters for the request.
   * @param {callback} successCallback Function to be executed in case of success response from twitter. Contains a count object as parameter.
   * @param {callback} errorCallback Function to be executed in case of error response from twitter.
   */
  getCount: function (parameters, successCallback, errorCallback) {
    var data = {
      url: this.countUrl + ('?' + OAuth.formEncode(parameters)),
      type: 'GET',
      header: [],
      parameters: ''
    };
    this.sendTwitterRequest(data, successCallback, errorCallback);
    // todo usability of this method, as getShareCount already present
  },
  /**
   * @method
   * @desc Function to retweet a twitter post.
   * @param {String} id Twitter id of the post that has to be shared.
   * @param {Object} parameters An object that contains the parameters for the request.
   * @param {callback} successCallback Function to be executed in case of success response from twitter. Contains a count object as parameter.
   * @param {callback} errorCallback Function to be executed in case of error response from twitter.
   */
  share: function (id, parameters, successCallback, errorCallback) {
    var service = this, data,
      shareTweet = function (id, parameters, successCallback, errorCallback) {
        data = service.getDataForRequest(service.shareUrl + id + ".json", parameters, 'POST');
        service.sendTwitterRequest(data, successCallback, errorCallback);
      },
      callback = (function (id, parameters, successCallback, errorCallback) {
        return function (isLoggedIn) {
          if (isLoggedIn) {
            shareTweet(id, parameters, successCallback, errorCallback);
          } else {
            service.startActionHandler(function () {
              shareTweet(id, parameters, successCallback, errorCallback);
            });
          }
        };
      })(id, parameters, successCallback, errorCallback);
    service.checkUserLoggedIn(callback);
  },
  /**
   * @method
   * @desc Function to Un follow a particular twitter user.
   * @param {Object} parameters An object that contains the parameters for the request.
   * @param {callback} successCallback Function to be executed in case of success response from twitter. Contains a count object as parameter.
   * @param {callback} errorCallback Function to be executed in case of error response from twitter.
   */
  unSubscribe: function (parameters, successCallback, errorCallback) {
    var data = this.getDataForRequest(this.unfollowUrl, parameters, 'POST');
    this.sendTwitterRequest(data, successCallback, errorCallback);
  },
  /**
   * @method
   * @desc Function to follow a particular twitter user.
   * @param {Object} parameters An object that contains the parameters for the request.
   * @param {callback} successCallback Function to be executed in case of success response from twitter. Contains a count object as parameter.
   * @param {callback} errorCallback Function to be executed in case of error response from twitter.
   */
  subscribe: function (parameters, successCallback, errorCallback) {
    var data = this.getDataForRequest(this.followUrl, parameters, 'POST');
    this.sendTwitterRequest(data, successCallback, errorCallback);
  },
  /**
   * @method
   * @desc Function to favourite a twitter post.
   * @param {Object} ObjectId Id of the object.
   * @param {callback} successCallback Function to be executed in case of success response from twitter. Contains a count object as parameter.
   * @param {callback} errorCallback Function to be executed in case of error response from twitter.
   */
  like: function (ObjectId, successCallback, errorCallback) {
    var parameters = {
      id: ObjectId
    };
    var service = this,
      postLike = function (parameters, successCallback, errorCallback) {
        var data = service.getDataForRequest(service.likeUrl, parameters, 'POST'),
          errorCall = function (resp) {
            if (JSON.parse(resp.responseText).errors[0]['code'] == 139) {
              // error code 139 comes when the user has liked the tweet already
              var likesObject = {
                message: JSON.parse(resp.responseText).errors[0]['message']
              };
              errorCallback(likesObject);
            }
          },
          successCall = function (resp) {

            var likesObject = {
              message: (resp.favorited) ? "You have successfully favorited this status/page." : "Try again"
            };
            successCallback(likesObject);

          };
        service.sendTwitterRequest(data, successCall, errorCall);
      },
      callback = (function (parameters, successCallback, errorCallback) {
        return function (isLoggedIn) {
          if (isLoggedIn) {
            postLike(parameters, successCallback, errorCallback);
          } else {
            service.startActionHandler(function () {
              postLike(parameters, successCallback, errorCallback);
            });
          }
        };
      })(parameters, successCallback, errorCallback);
    service.checkUserLoggedIn(callback);
  },
  /**
   * @method
   * @desc Function to Un favourite a twitter post.
   * @param {Object} parameters An object that contains the parameters for the request.
   * @param {callback} successCallback Function to be executed in case of success response from twitter. Contains a count object as parameter.
   * @param {callback} errorCallback Function to be executed in case of error response from twitter.
   */
  unlike: function (ObjectId, successCallback, errorCallback) {
    var parameters = {
      id: ObjectId
    };
    var service = this,
      postUnlike = function (parameters, successCallback, errorCallback) {
        var data = service.getDataForRequest(service.unlikeUrl, parameters, 'POST');
        service.sendTwitterRequest(data, successCallback, errorCallback);
      },
      callback = (function (parameters, successCallback, errorCallback) {
        return function (isLoggedIn) {
          if (isLoggedIn) {
            postUnlike(parameters, successCallback, errorCallback);
          } else {
            service.startActionHandler(function () {
              postUnlike(parameters, successCallback, errorCallback);
            });
          }
        };
      })(parameters, successCallback, errorCallback);
    service.checkUserLoggedIn(callback);
  },
  /**
   * @method
   * @desc Function to get the tweets for a particular url.
   * @param {Object} parameters An object that contains the parameters for the request.
   * @param {callback} successCallback Function to be executed in case of success response from twitter. Contains a count object as parameter.
   * @param {callback} errorCallback Function to be executed in case of error response from twitter.
   */
  getCommentsForUrl: function (parameters, successCallback, errorCallback) {
    var requestObject = {
      q: parameters.url,
      rpp: parameters.limit || 10,
      page: Math.ceil(parameters.offset / parameters.limit) || 1
    };
    this.searchTweets(requestObject, function (response) {
      var sbwObject = [],
        sbwTweetObject, index;
      var tweets = response.results,
        tweet;
      for (index in tweets) {
        if (tweets.hasOwnProperty(index)) {
          tweet = tweets[index];
          if (tweet.created_at && tweet.from_user && tweet.text && tweet.profile_image_url) {
            sbwTweetObject = new SBW.Models.Comment({
              createdTime: tweet.created_at,
              fromUser: tweet.from_user,
              likeCount: 0,
              text: tweet.text,
              userImage: tweet.profile_image_url,
              serviceName: "twitter"
            });
            sbwObject.push(sbwTweetObject);
          }
        }
      }
      successCallback(sbwObject);
    }, errorCallback);
  }
});
/**
 * @class  Instagram
 * @classdesc This is Imstagram service implementation
 * @augments ServiceController
 * @constructor
 **/

SBW.Controllers.Services.Instagram = SBW.Controllers.Services.ServiceController.extend(/** @lends SBW.Controllers.Services.Instagram# */{
  name: 'instagram',
  icon: 'instagram',
  isPhotoSetSupported: false,

  authWindowReference: null,
  content:[],

  init: function () {
    var clientID = SBW.Singletons.config.services.Instagram.apiKey,
      callbackURL = SBW.Singletons.utils.callbackURLForService('instagram');
    this.apiUrl = "https://api.instagram.com/v1/";
    this.accessObject = {
      clientId: clientID,
      callbackUrl: callbackURL,
      accessTokenUrl: 'http://api.instagram.com/oauth/authorize/?client_id=' + clientID + '&redirect_uri=' + callbackURL + '&response_type=token' + '&scope=likes+comments',
      access_token: null
    };
  },
  /**
   * @method
   * @decs This function is called by serviceController on Click of start of button instagram service's authorize view page. gets the accessTokenUrl, forms the authentication url, opens the popup with signed url and calls for auth token listener.
   * @param {Callback} callback function to be called after successful authentication
   */
  startActionHandler: function (callback) {
    var service = this;
    service.eraseCookie('instagramToken');
    service.accessObject.access_token = null;
    var tokenListner = function (windowRef) {
      if (!windowRef.closed) {
        if (service.getCookie('instagramToken')) {
          windowRef.close();
          service.accessObject.access_token = service.getCookie('instagramToken');
          callback();
        } else {
          setTimeout(function () {
            tokenListner(windowRef);
          }, 2000);
        }
      } else {
        service.isUserLoggingIn = false;
      }
    };
    if (service.authWindowReference === null || service.authWindowReference.closed) {
      service.authWindowReference = window.open(service.accessObject.accessTokenUrl, "Instagram" + new Date().getTime(), service.getPopupWindowParams({width: 800, height: 300}));
      tokenListner(service.authWindowReference);
    } else {
      service.authWindowReference.focus();
    }
  },
  /**
   * @method
   * @decs This function is called by serviceController to verify whether the user is logged in or not.This function creates a signed url for checking the auth token validation and makes an jsonp request.
   * @param {Callback} callback Function that will be called with the flag of whether the user is logged in or not (true are false).
   */
  checkUserLoggedIn: function (callback) {
    var service = this,
      access_token = service.accessObject.access_token,
      url = "https://api.instagram.com/v1/users/self/?access_token=" + access_token;
    SBW.Singletons.utils.ajax({
        url: url,
        type: 'GET',
        dataType: "jsonp"
      }, function (response) {
        if (response.meta.code === 200) {
          callback(true);
        } else {
          callback(false);
        }
      }
    );
  },
  /**
   * @method
   * @desc To get logged in user profile through Instagram API service
   * @param {String} userId  Id of the service user.
   * @param {Function} successCallback  {@link SBW.Controllers.Services.ServiceController~getProfile-successCallback Callback} to be executed on successful profile retrieving.
   * @param {Function} errorCallback  {@link SBW.Controllers.Services.ServiceController~getProfile-errorCallback Callback} to be executed on retrieving profile error.
   */
  getProfile: function (userId, successCallback, errorCallback) {
    userId = ((userId !== undefined) ? userId : 'self');
    var service = this,
      publish = function (successCallback, errorCallback) {
        SBW.Singletons.utils.ajax({
            url: service.apiUrl + '/users/' + userId,
            type: 'GET',
            dataType: "jsonp",
            data: {access_token: service.accessObject.access_token}
          }, function (response) {
            if (response.meta.code === 200) {
              var user = new SBW.Models.User({
                name: response.data.full_name,
                id: response.data.id,
                userImage: response.data.profile_picture,
                rawData: response
              });
              successCallback(user);
            } else {
              var errorObject = new SBW.Models.Error({
                message: response.meta.error_message,
                serviceName: 'instagram',
                rawData: response,
                code: response.meta.code
              });
              errorCallback(errorObject);
            }
          },
          errorCallback
        );
      },
      callback = (function (successCallback, errorCallback) {
        return function (isLoggedIn) {
          if (isLoggedIn) {
            publish(successCallback, errorCallback);
          } else {
            service.startActionHandler(function () {
              publish(successCallback, errorCallback);
            });
          }
        };
      })(successCallback, errorCallback);
    service.checkUserLoggedIn(callback);
  },
  /**
   * @method
   * @desc To get comments of a Photo through Instagram API service
   * method doesn't require any authentication
   * @param {Object} idObject
   * @param {Callback} successCallback {@link  SBW.Controllers.Services.ServiceController~getComments-successCallback Callback} will be called if data is fetched successfully
   * @param {Callback} errorCallback {@link  SBW.Controllers.Services.ServiceController~getComments-errorCallback Callback} will be called in case of any error while fetching data
   */
  getComments: function (idObject, successCallback, errorCallback) {
    var service = this,
      publish = function (idObject, successCallback, errorCallback) {
        SBW.Singletons.utils.ajax({
            url: service.apiUrl + '/media/' + idObject.assetId + '/comments',
            type: 'GET',
            dataType: "jsonp",
            data: {access_token: service.accessObject.access_token}
          }, successCallback,
          errorCallback
        );
      },
      callback = (function (idObject, successCallback, errorCallback) {
        return function (isLoggedIn) {
          if (isLoggedIn) {
            publish(idObject, successCallback, errorCallback);
          } else {
            service.startActionHandler(function () {
              publish(idObject, successCallback, errorCallback);
            });
          }
        };
      })(idObject, successCallback, errorCallback);
    service.checkUserLoggedIn(callback);
  },
  /**
   * @method
   * @desc To like(favorite) a media through instagram API service
   * @param {String} mediaId
   * @param {Callback} successCallback {@link  SBW.Controllers.Services.ServiceController~like-successCallback Callback} will be called if like is successful
   * @param {Callback} errorCallback {@link  SBW.Controllers.Services.ServiceController~like-errorCallback Callback} will be called in case of any error while liking
   */
  like: function (mediaId, successCallback, errorCallback) {
    var service = this,
      publish = function (mediaId, successCallback, errorCallback) {
        SBW.Singletons.utils.ajax({
            url: SBW.Singletons.config.proxyURL + '?url=' + service.apiUrl + '/media/' + mediaId + '/likes',
            type: 'POST',
            data: {access_token: service.accessObject.access_token}
          }, successCallback,
          errorCallback
        );
      },
      callback = (function (mediaId, successCallback, errorCallback) {
        return function (isLoggedIn) {
          if (isLoggedIn) {
            publish(mediaId, successCallback, errorCallback);
          } else {
            service.startActionHandler(function () {
              publish(mediaId, successCallback, errorCallback);
            });
          }
        };
      })(mediaId, successCallback, errorCallback);
    service.checkUserLoggedIn(callback);
  },
  /**
   * @method
   * @desc To unlike(un-favorite) a media through instagram API service
   * @param {String} mediaId
   * @param {Callback} successCallback {@link  SBW.Controllers.Services.ServiceController~unlike-successCallback Callback} will be called if unlike is successful
   * @param {Callback} errorCallback {@link  SBW.Controllers.Services.ServiceController~unlike-errorCallback Callback} will be called in case of any error while unliking
   */
  unlike: function (mediaId, successCallback, errorCallback) {
    var service = this,
      publish = function (mediaId, successCallback, errorCallback) {
        SBW.Singletons.utils.ajax({
            url: SBW.Singletons.config.proxyURL + '?url=' + service.apiUrl + '/media/' + mediaId + '/likes?access_token=' + service.accessObject.access_token,
            type: 'DELETE'
          }, successCallback,
          errorCallback
        );
      },
      callback = (function (mediaId, successCallback, errorCallback) {
        return function (isLoggedIn) {
          if (isLoggedIn) {
            publish(mediaId, successCallback, errorCallback);
          } else {
            service.startActionHandler(function () {
              publish(mediaId, successCallback, errorCallback);
            });
          }
        };
      })(mediaId, successCallback, errorCallback);
    service.checkUserLoggedIn(callback);
  },
  /**
   * @method
   * @desc To get likes(favorites) for the photo given through instagram API service
   * The method doesn't require any authentication
   * @param {String} mediaId
   * @param {Callback} successCallback {@link  SBW.Controllers.Services.ServiceController~getLikes-successCallback Callback} will be called if data is fetched successfully
   * @param {Callback} errorCallback {@link  SBW.Controllers.Services.ServiceController~getLikes-errorCallback Callback} will be called in case of any error while fetching data
   */
  getLikes: function (mediaId, successCallback, errorCallback) {
    var service = this,
      publish = function (mediaId, successCallback, errorCallback) {
        SBW.Singletons.utils.ajax({
            url: service.apiUrl + '/media/' + mediaId + '/likes',
            type: 'GET',
            dataType: "jsonp",
            data: {access_token: service.accessObject.access_token}
          }, function (response) {
            if (response.meta.code === 200) {
              var likesData = [], i, user;
              for (i = 0; i < response.data.length; i++) {
                user = new SBW.Models.User({
                  name: response.data[i].full_name,
                  id: response.data[i].id,
                  userImage: response.data[i].profile_picture
                });
                likesData[i] = new SBW.Models.Like({
                  user: user,
                  rawData: response.data[i]
                });
              }
              var likesObject = {
                serviceName: 'instagram',
                likes: likesData,
                likeCount: likesData.length,
                rawData: response
              };
              // Todo Populating the asset object with the like and user objects
              successCallback(likesObject);
            } else {
              var errorObject = new SBW.Models.Error({
                message: response.meta.error_message,
                serviceName: 'instagram',
                rawData: response,
                code: response.meta.code
              });
              errorCallback(errorObject);
            }
          }, errorCallback
        );
      },
      callback = (function (mediaId, successCallback, errorCallback) {
        return function (isLoggedIn) {
          if (isLoggedIn) {
            publish(mediaId, successCallback, errorCallback);
          } else {
            service.startActionHandler(function () {
              publish(mediaId, successCallback, errorCallback);
            });
          }
        };
      })(mediaId, successCallback, errorCallback);
    service.checkUserLoggedIn(callback);
  },
  /**
   * @method
   * @desc To get Media of the user through instagram API service
   * @param {String} userId
   * @param {Callback} successCallback  will be called if data is fetched successfully
   * @param {Callback} errorCallback  will be called in case of any error while fetching data
   */
  getMedia: function (userId, successCallback, errorCallback) {
    var service = this,
      publish = function (userId, successCallback, errorCallback) {
        if(service.content.length>0){
          successCallback(service.content[0].assets);
        }else{
          SBW.Singletons.utils.ajax({
              url: service.apiUrl + '/users/' + userId + '/media/recent',
              data: {access_token: service.accessObject.access_token},
              type: 'GET',
              dataType: 'jsonp'
            },
            function (response) {
              if (response.meta.code === 200) {
                var content = new Array(),
                  assets = response.data;
                assets.forEach(function (asset) {
                  var collection = new SBW.Models.ImageAsset({
                      id: '',
                      src: asset.images.standard_resolution.url,
                      title: asset.caption === null ? null : asset.caption.text,
                      createdTime: new Date().getTime(),
                      serviceName: 'instagram',
                      rawData: asset,
                      status: 'private',
                      imgSizes: {
                        t: asset.images.thumbnail.url,
                        s: asset.images.thumbnail.url,
                        m: asset.images.low_resolution.url,
                        l: asset.images.standard_resolution.url
                      },
                      metadata: {
                        caption: asset.caption,
                        type: asset.type,
                        dateTaken: new Date(asset.created_time * 1000).toDateString(),
                        dateUpdated: null,
                        dateUploaded: null,
                        comments: null,
                        size: null,
                        assetId: asset.id,
                        assetCollectionId: null,
                        height: asset.images.standard_resolution.height,
                        width: asset.images.standard_resolution.width,
                        commentCount: asset.comments.count,
                        category: null,
                        exifMake: null,
                        exifModel: null,
                        iptcKeywords: null,
                        orientation: null,
                        tags: asset.tags,
                        downloadUrl: asset.images.standard_resolution.url,
                        originalFormat: null,
                        fileName: null,
                        version: null,
                        description: asset.caption,
                        thumbnail: asset.images.thumbnail.url,
                        previewUrl: asset.images.standard_resolution.url,
                        author: new SBW.Models.User({
                          name: asset.user.full_name,
                          id: asset.user.id,
                          userImage: asset.user.profile_picture
                        }),
                        authorAvatar: null,
                        likeCount: asset.likes.count,
                        likes: asset.likes.data
                      }
                    }),
                    comments = asset.comments.data,
                    commentsArray = new Array(),
                    likes = asset.likes.data,
                    likesArray = new Array();
                  collection.id = collection.getID();
                  comments.forEach(function (comment) {
                    var commentObject = new SBW.Models.Comment({
                      text: comment.text,
                      id: comment.id,
                      createdTime: comment.created_time,
                      fromUser: comment.from.full_name,
                      likeCount: null,
                      userImage: comment.from.profile_picture,
                      rawData: comment,
                      serviceName: 'instagram'
                    });
                    commentsArray.push(commentObject);
                  });
                  collection.metadata.comments = commentsArray;
                  likes.forEach(function (like) {
                    var likeObject = new SBW.Models.Like({
                      user: new SBW.Models.User({
                        name: like.full_name,
                        id: like.id,
                        userImage: like.profile_picture
                      }),
                      rawData: like
                    });
                    likesArray.push(likeObject);
                  });
                  collection.metadata.likes = likesArray;
                  content.push(collection);
                });
                successCallback(content);
              } else {
                var errorObject = new SBW.Models.Error({
                  message: response.meta.error_message,
                  serviceName: 'instagram',
                  rawData: response,
                  code: response.meta.code
                });
                errorCallback(errorObject);
              }
            }, errorCallback
          );
        }
      },
      callback = (function (userId, successCallback, errorCallback) {
        return function (isLoggedIn) {
          if (isLoggedIn) {
            publish(userId, successCallback, errorCallback);
          } else {
            service.startActionHandler(function () {
              publish(userId, successCallback, errorCallback);
            });
          }
        };
      })(userId, successCallback, errorCallback);
    service.checkUserLoggedIn(callback);
  },
  /**
   * @method
   * @desc To get albums from a logged in user through flickr API service
   * The method doesn't require any authentication
   * @param {String} userId
   * @param {Callback} successCallback
   * @param {Callback} errorCallback
   */
  getAlbums: function (successCallback, errorCallback, userId) {
    var user = userId || 'self', service = this,
      createPseudoAlbum = function(imageAssets){
       var collection = new SBW.Models.AssetCollection({
          title: '',
          createdTime: new Date().getTime(),
          serviceName: 'instagram',
          assets:imageAssets,
          metadata: {
            numAssets:imageAssets.length,
            assetCollectionId: '',
            thumbnail: imageAssets[0].metadata.thumbnail || '',
            author: imageAssets[0].metadata.author.name
          }
        });
        collection.id = collection.getID();
        service.content.push(collection);
        successCallback(service.content);
      };
    if(service.content.length>0){
     successCallback(service.content);
    }else{
      service.getMedia(user, createPseudoAlbum, errorCallback);
    }
  },
  /**
   * @method
   * @desc To get albums from a logged in user through flickr API service
   * The method doesn't require any authentication
   * @param {String} userId
   * @param {Callback} successCallback
   * @param {Callback} errorCallback
   */
  getPhotosFromAlbum: function (userId, successCallback, errorCallback) {
    var user = userId || 'self'
    this.getMedia(user, successCallback, errorCallback);
  }

});
// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// the compiled file.
//
// WARNING: THE FIRST BLANK LINE MARKS THE END OF WHAT'S TO BE PROCESSED, ANY BLANK LINE SHOULD
// GO AFTER THE REQUIRES BELOW.
//
















;
