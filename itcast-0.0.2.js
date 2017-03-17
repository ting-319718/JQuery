// 为了防止变量以及全局对象的污染，在开发框架时要引入沙箱模式
( function ( global ){
  var document = global.document,
      arr = [],
      push = arr.push;
 
  // 引入工厂函数，目的是为了兼容框架的使用者 在创建框架内部对象时， 带new与不带的两种情况
  function itcast ( selector ) {
    return new itcast.fn.init( selector );
  }

  itcast.fn = itcast.prototype = {
    constructor: itcast
  };

  var init = itcast.fn.init = function ( selector ) {
    // selector类型
    // 1 无效值 null undefined ''
    if ( !selector ){
      return this;
    // 2 字符串
    } else if ( itcast.isString( selector ) ){
       // a html 字符串
      if ( itcast.isHTML( selector) ){
       push.apply( this, itcast.parseHTML( selector ) );
      //  b 选择器
      } else {
        // 获取选择器对应的dom元素，并且以 伪数组的形式存储在this上
        push.apply( this, document.querySelectorAll( selector ) );
      }
     // 3 dom对象
    } else if ( itcast.isDOM( selector ) ){
      this[ 0 ] = selector;
      this.length = 1;
     // 4 dom数组或伪数组
    } else if ( itcast.isArrayLike( selector ) ){
      push.apply( this, selector );
     // 5 函数
    } else if ( itcast.isFunction( selector ) ){
      document.addEventListener( 'DOMContentLoaded', function (){
        selector();
      } );
    }
  };  

  init.prototype = itcast.prototype;

  itcast.extend = function () {
    var args = arguments,
        l = args.length,
        i = 0,
        obj,
        k;

    for ( ; i < l; i++ ){
      obj = args[ i ];
      for ( k in obj ){
        if ( obj.hasOwnProperty( k ) ){
          this[ k ] = obj[ k ];
        }
      }
    }

    return this;
  };

  // 工具类方法
  itcast.extend( {
    type: function ( obj ) {
      if ( obj == null ){
        return obj + '';
      }

      return typeof obj !== 'object' ? typeof obj:
          Object.prototype.toString.call( obj ).slice( 8, -1 ).toLowerCase(); 
    },
    parseHTML: function ( html ){
       // 存储所有创建的dom元素
      var ret = [],
          div,
          node;

      div = document.createElement( 'div' );
      div.innerHTML = html;
      for ( node = div.firstChild; node; node = node.nextSibling ){
        if ( node.nodeType === 1 ){
          ret.push( node );
        }
      }

      return ret;
    }
  } );

  // 工具类方法-类型判断方法
  itcast.extend( {
    isString: function ( obj ) {
      return typeof obj === 'string';
    },
    isHTML: function ( obj ) {
      // 满足三个条件
      // 以 < 开头 并且 以 > 结尾 并且 最小长度为 3
      return obj.charAt( 0 ) === '<' && obj.charAt( obj.length - 1 ) === '>' && obj.length >= 3;
    },
    isDOM: function ( obj ) {
      // obj不为null 或 undefined值 并且具有 nodeType属性
      return !!obj && !!obj.nodeType;
    },
    isArrayLike: function ( obj ) {
      // 是数组 或者 伪数组 返回值为 true，其他情况返回false
      // 伪数组怎么判断 
      // 过滤函数 和 window对象,因为他们的length属性不是表达元素的个数
      // 如果length 为 0 ，就认为是 伪数组
      // 如果length 大于0，必须保证 obj具有 length - 1 索引
      // 因为 不管是普通数组 或者 稀疏数组，都必须具有 length - 1 索引
      var type = itcast.type( obj ), // 获取obj类型
          length = !!obj && 'length' in obj && obj.length; // 获取obj的length属性值

      // 过滤掉函数和window
      if ( type === 'function' || itcast.isWindow( obj ) ){
        return false;
      }

      return type === 'array' || length === 0 || 
        typeof length === 'number' && length > 0 && ( length - 1 ) in obj;

    },
    isFunction: function ( obj ) {
      return typeof obj === 'function';
    },
    isWindow: function ( obj ) {
      // 保证obj不是 null undefined，并且具有window属性引用自己
      return !!obj && obj.window === obj;
    }
  } );

  // 支持模块化开发
  // support SeaJS RequireJS
  if ( typeof define === 'function' ){
    define( function (){
      return itcast;
    } );
    // support NodeJS
  } else if ( typeof exports !== 'undefined' ){
    module.exports = itcast;
  } else {
    global.$ = itcast;
  } 

}( window ) );