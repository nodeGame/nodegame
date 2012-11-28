/*!
 * Shelf.JS - Persistent Client-Side Storage @VERSION
 * 
 * Copyright 2012 Stefano Balietti
 * GPL licenses.
 * 
 */
(function( wall, undefined ){

	
	var version = '0.2';
	
	var store = wall.store = function( key, value, options, type ) {
		var type = store.type;
		if ( options && options.type && options.type in store.types ) {
			type = options.type;
		}
		
		if (store.verbosity) {
			store.log('I am using storage type ' + type);
		}
		
		return store.types[type](key, value, options || {} );
	};
	
	// Adding functions and properties to store
	///////////////////////////////////////////
	store.verbosity = 0;
	store.types = {};
	store.type = null;
	store.addType = function (type, storage) {
		if ( !store.type ) {
			store.type = type;
		}
	
		store.types[type] = storage;
		store[type] = function (key, value, options) {
			options = options || {};
			options.type = type;
			return store( key, value, options );
		};
	};
	store.error = function() {
		return "shelf quota exceeded"; 
	};
	store.log = function(text) {
		console.log('Shelf v.' + version + ': ' + text);
	};
	
	Object.defineProperty(store, 'persistent', {
    	set: function(){},
    	get: function(){
    		// If we have only memory type enabled 
    		return (store.types.length < 2) ? false : true;
    	},
    	configurable: false,
	});
	
	store.decycle = function(o) {
    	if (JSON && JSON.decycle && 'function' === typeof JSON.decycle) {
			o = JSON.decycle(o);
		}
    	return o;
    };
	    
    store.retrocycle = function(o) {
    	if (JSON && JSON.retrocycle && 'function' === typeof JSON.retrocycle) {
			o = JSON.retrocycle(o);
		}
    	return o;
    };
	
    store.stringify = function(o) {
    	if (!JSON || !JSON.stringify || 'function' !== typeof JSON.stringify) {
    		throw new Error('JSON.stringify not found. Received non-string value and could not serialize.');
		}
    	
    	o = store.decycle(o);
		return JSON.stringify(o);
    };
    
    store.parse = function(o) {
    	if (JSON && JSON.parse && 'function' === typeof JSON.parse) {
    		try {
    			o = JSON.parse(o);
    		}
    		catch (e) {}
		}
    	
    	o = store.retrocycle(o);
    	return o;
    };
    
	/////////////////////////////////////////////
	
	var rprefix = /^__shelf__/;
	function createFromStorageInterface(storageType, storage) {
		store.addType( storageType, function( key, value, options ) {
			var storedValue, parsed, i, remove,
				ret = value,
				now = (new Date()).getTime();
	
			if ( !key ) {
				ret = {};
				remove = [];
				i = 0;
				try {
					// accessing the length property works around a localStorage bug
					// in Firefox 4.0 where the keys don't update cross-page
					// we assign to key just to avoid Closure Compiler from removing
					// the access as "useless code"
					// https://bugzilla.mozilla.org/show_bug.cgi?id=662511
					key = storage.length;
	
					while ( key = storage.key( i++ ) ) {
						if ( rprefix.test( key ) ) {
							parsed = store.parse( storage.getItem( key ) );
							if ( parsed.expires && parsed.expires <= now ) {
								remove.push( key );
							} else {
								ret[ key.replace( rprefix, "" ) ] = parsed.data;
							}
						}
					}
					while ( key = remove.pop() ) {
						storage.removeItem( key );
					}
				} catch ( error ) {}
				return ret;
			}
	
			// protect against name collisions with direct storage
			key = "__shelf__" + key;
	

			if ( value === undefined ) {
				storedValue = storage.getItem( key );
				parsed = storedValue ? store.parse( storedValue ) : { expires: -1 };
				if ( parsed.expires && parsed.expires <= now ) {
					storage.removeItem( key );
				} else {
					return parsed.data;
				}
			} else {
				if ( value === null ) {
					storage.removeItem( key );
				} else {
					parsed = store.stringify({
						data: value,
						expires: options.expires ? now + options.expires : null,
					});
					try {
						storage.setItem( key, parsed );
					// quota exceeded
					} catch( error ) {
						// expire old data and try again
						store[ storageType ]();
						try {
							storage.setItem( key, parsed );
						} catch( error ) {
							throw store.error();
						}
					}
				}
			}
	
			return ret;
		});
	}
	
	// localStorage + sessionStorage
	// IE 8+, Firefox 3.5+, Safari 4+, Chrome 4+, Opera 10.5+, iPhone 2+, Android 2+
	for ( var webStorageType in { localStorage: 1, sessionStorage: 1, } ) {
		// try/catch for file protocol in Firefox
		try {
			if (window[webStorageType].getItem) {
				createFromStorageInterface(webStorageType, window[webStorageType]);
			}
		} catch( e ) {}
	}
	
	// globalStorage
	// non-standard: Firefox 2+
	// https://developer.mozilla.org/en/dom/storage#globalStorage
	if ( !store.types.localStorage && window.globalStorage ) {
		// try/catch for file protocol in Firefox
		try {
			createFromStorageInterface( "globalStorage",
				window.globalStorage[ window.location.hostname ] );
			// Firefox 2.0 and 3.0 have sessionStorage and globalStorage
			// make sure we default to globalStorage
			// but don't default to globalStorage in 3.5+ which also has localStorage
			if ( store.type === "sessionStorage" ) {
				store.type = "globalStorage";
			}
		} catch( e ) {}
	}
	
	// userData
	// non-standard: IE 5+
	// http://msdn.microsoft.com/en-us/library/ms531424(v=vs.85).aspx
	(function() {
		// IE 9 has quirks in userData that are a huge pain
		// rather than finding a way to detect these quirks
		// we just don't register userData if we have localStorage
		if ( store.types.localStorage ) {
			return;
		}
	
		// append to html instead of body so we can do this from the head
		var div = document.createElement( "div" ),
			attrKey = "shelf";
		div.style.display = "none";
		document.getElementsByTagName( "head" )[ 0 ].appendChild( div );
	
		// we can't feature detect userData support
		// so just try and see if it fails
		// surprisingly, even just adding the behavior isn't enough for a failure
		// so we need to load the data as well
		try {
			div.addBehavior( "#default#userdata" );
			div.load( attrKey );
		} catch( e ) {
			div.parentNode.removeChild( div );
			return;
		}
	
		store.addType( "userData", function( key, value, options ) {
			div.load( attrKey );
			var attr, parsed, prevValue, i, remove,
				ret = value,
				now = (new Date()).getTime();
	
			if ( !key ) {
				ret = {};
				remove = [];
				i = 0;
				while ( attr = div.XMLDocument.documentElement.attributes[ i++ ] ) {
					parsed = store.parse( attr.value );
					if ( parsed.expires && parsed.expires <= now ) {
						remove.push( attr.name );
					} else {
						ret[ attr.name ] = parsed.data;
					}
				}
				while ( key = remove.pop() ) {
					div.removeAttribute( key );
				}
				div.save( attrKey );
				return ret;
			}
	
			// convert invalid characters to dashes
			// http://www.w3.org/TR/REC-xml/#NT-Name
			// simplified to assume the starting character is valid
			// also removed colon as it is invalid in HTML attribute names
			key = key.replace( /[^-._0-9A-Za-z\xb7\xc0-\xd6\xd8-\xf6\xf8-\u037d\u37f-\u1fff\u200c-\u200d\u203f\u2040\u2070-\u218f]/g, "-" );
			// adjust invalid starting character to deal with our simplified sanitization
			key = key.replace( /^-/, "_-" );
	
			if ( value === undefined ) {
				attr = div.getAttribute( key );
				parsed = attr ? store.parse( attr ) : { expires: -1 };
				if ( parsed.expires && parsed.expires <= now ) {
					div.removeAttribute( key );
				} else {
					return parsed.data;
				}
			} else {
				if ( value === null ) {
					div.removeAttribute( key );
				} else {
					// we need to get the previous value in case we need to rollback
					prevValue = div.getAttribute( key );
					parsed = store.stringify({
						data: value,
						expires: (options.expires ? (now + options.expires) : null)
					});
					div.setAttribute( key, parsed );
				}
			}
	
			try {
				div.save( attrKey );
			// quota exceeded
			} catch ( error ) {
				// roll the value back to the previous value
				if ( prevValue === null ) {
					div.removeAttribute( key );
				} else {
					div.setAttribute( key, prevValue );
				}
	
				// expire old data and try again
				store.userData();
				try {
					div.setAttribute( key, parsed );
					div.save( attrKey );
				} catch ( error ) {
					// roll the value back to the previous value
					if ( prevValue === null ) {
						div.removeAttribute( key );
					} else {
						div.setAttribute( key, prevValue );
					}
					throw store.error();
				}
			}
			return ret;
		});
	}() );
	
	
	// cookie storage
	(function() {
		
		var cookie = ( function() {
			
			var resolveOptions, assembleOptionsString, parseCookies, constructor, defaultOptions = {
				expiresAt: null,
				path: '/',
				domain:  null,
				secure: false,
			};
			
			/**
			* resolveOptions - receive an options object and ensure all options are present and valid, replacing with defaults where necessary
			*
			* @access private
			* @static
			* @parameter Object options - optional options to start with
			* @return Object complete and valid options object
			*/
			resolveOptions = function( options ){
				
				var returnValue, expireDate;
	
				if( typeof options !== 'object' || options === null ){
					returnValue = defaultOptions;
				}
				else {
					returnValue = {
						expiresAt: defaultOptions.expiresAt,
						path: defaultOptions.path,
						domain: defaultOptions.domain,
						secure: defaultOptions.secure,
					};
	
					if (typeof options.expiresAt === 'object' && options.expiresAt instanceof Date ) {
						returnValue.expiresAt = options.expiresAt;
					}
					else if (typeof options.hoursToLive === 'number' && options.hoursToLive !== 0 ){
						expireDate = new Date();
						expireDate.setTime( expireDate.getTime() + ( options.hoursToLive * 60 * 60 * 1000 ) );
						returnValue.expiresAt = expireDate;
					}
	
					if (typeof options.path === 'string' && options.path !== '' ) {
						returnValue.path = options.path;
					}
	
					if (typeof options.domain === 'string' && options.domain !== '' ) {
						returnValue.domain = options.domain;
					}
	
					if (options.secure === true ) {
						returnValue.secure = options.secure;
					}
				}
	
				return returnValue;
			};
			
			/**
			* assembleOptionsString - analyze options and assemble appropriate string for setting a cookie with those options
			*
			* @access private
			* @static
			* @parameter options OBJECT - optional options to start with
			* @return STRING - complete and valid cookie setting options
			*/
			assembleOptionsString = function (options) {
				options = resolveOptions( options );
	
				return (
					( typeof options.expiresAt === 'object' && options.expiresAt instanceof Date ? '; expires=' + options.expiresAt.toGMTString() : '' ) +
					'; path=' + options.path +
					( typeof options.domain === 'string' ? '; domain=' + options.domain : '' ) +
					( options.secure === true ? '; secure' : '' )
				);
			};
			
			/**
			* parseCookies - retrieve document.cookie string and break it into a hash with values decoded and unserialized
			*
			* @access private
			* @static
			* @return OBJECT - hash of cookies from document.cookie
			*/
			parseCookies = function() {
				var cookies = {}, i, pair, name, value, separated = document.cookie.split( ';' ), unparsedValue;
				for( i = 0; i < separated.length; i = i + 1 ){
					pair = separated[i].split( '=' );
					name = pair[0].replace( /^\s*/, '' ).replace( /\s*$/, '' );
	
					try {
						value = decodeURIComponent( pair[1] );
					}
					catch( e1 ) {
						value = pair[1];
					}
	
//					if (JSON && 'object' === typeof JSON && 'function' === typeof JSON.parse) {
//						try {
//							unparsedValue = value;
//							value = JSON.parse( value );
//						}
//						catch (e2) {
//							value = unparsedValue;
//						}
//					}
	
					cookies[name] = store.parse(value);
				}
				return cookies;
			};
	
			constructor = function(){};
	
			
			/**
			 * get - get one, several, or all cookies
			 *
			 * @access public
			 * @paramater Mixed cookieName - String:name of single cookie; Array:list of multiple cookie names; Void (no param):if you want all cookies
			 * @return Mixed - Value of cookie as set; Null:if only one cookie is requested and is not found; Object:hash of multiple or all cookies (if multiple or all requested);
			 */
			constructor.prototype.get = function( cookieName ) {
				
				var returnValue, item, cookies = parseCookies();
	
				if( typeof cookieName === 'string' ) {
					returnValue = ( typeof cookies[cookieName] !== 'undefined' ) ? cookies[cookieName] : null;
				}
				else if (typeof cookieName === 'object' && cookieName !== null ) {
					returnValue = {};
					for (item in cookieName ) {
						if (typeof cookies[cookieName[item]] !== 'undefined' ) {
							returnValue[cookieName[item]] = cookies[cookieName[item]];
						}
						else {
							returnValue[cookieName[item]] = null;
						}
					}
				}
				else {
					returnValue = cookies;
				}
	
				return returnValue;
			};
			
			/**
			 * filter - get array of cookies whose names match the provided RegExp
			 *
			 * @access public
			 * @paramater Object RegExp - The regular expression to match against cookie names
			 * @return Mixed - Object:hash of cookies whose names match the RegExp
			 */
			constructor.prototype.filter = function (cookieNameRegExp) {
				var cookieName, returnValue = {}, cookies = parseCookies();
	
				if (typeof cookieNameRegExp === 'string') {
					cookieNameRegExp = new RegExp( cookieNameRegExp );
				}
	
				for (cookieName in cookies ) {
					if (cookieName.match(cookieNameRegExp)) {
						returnValue[cookieName] = cookies[cookieName];
					}
				}
	
				return returnValue;
			};
			
			/**
			 * set - set or delete a cookie with desired options
			 *
			 * @access public
			 * @paramater String cookieName - name of cookie to set
			 * @paramater Mixed value - Any JS value. If not a string, will be JSON encoded; NULL to delete
			 * @paramater Object options - optional list of cookie options to specify
			 * @return void
			 */
			constructor.prototype.set = function( cookieName, value, options ){
				if (typeof options !== 'object' || options === null) {
					options = {};
				}
	
				if (typeof value === 'undefined' || value === null) {
					value = '';
					options.hoursToLive = -8760;
				}
	
				else if (typeof value !== 'string'){
//					if( typeof JSON === 'object' && JSON !== null && typeof store.stringify === 'function' ) {
//						
//						value = JSON.stringify( value );
//					}
//					else {
//						throw new Error( 'cookies.set() received non-string value and could not serialize.' );
//					}
					
					value = store.stringify( value );
				}
	
	
				var optionsString = assembleOptionsString( options );
	
				document.cookie = cookieName + '=' + encodeURIComponent( value ) + optionsString;
			};
			
			/**
			 * del - delete a cookie (domain and path options must match those with which the cookie was set; this is really an alias for set() with parameters simplified for this use)
			 *
			 * @access public
			 * @paramater MIxed cookieName - String name of cookie to delete, or Bool true to delete all
			 * @paramater Object options - optional list of cookie options to specify ( path, domain )
			 * @return void
			 */
			constructor.prototype.del = function( cookieName, options ) {
				var allCookies = {}, name;
	
				if( typeof options !== 'object' || options === null ) {
					options = {};
				}
	
				if( typeof cookieName === 'boolean' && cookieName === true ) {
					allCookies = this.get();
				}
				else if( typeof cookieName === 'string' ) {
					allCookies[cookieName] = true;
				}
	
				for( name in allCookies ) {
					if( typeof name === 'string' && name !== '' ) {
						this.set( name, null, options );
					}
				}
			};
			
			/**
			 * test - test whether the browser is accepting cookies
			 *
			 * @access public
			 * @return Boolean
			 */
			constructor.prototype.test = function() {
				var returnValue = false, testName = 'cT', testValue = 'data';
	
				this.set( testName, testValue );
	
				if( this.get( testName ) === testValue ) {
					this.del( testName );
					returnValue = true;
				}
	
				return returnValue;
			};
			
			/**
			 * setOptions - set default options for calls to cookie methods
			 *
			 * @access public
			 * @param Object options - list of cookie options to specify
			 * @return void
			 */
			constructor.prototype.setOptions = function( options ) {
				if( typeof options !== 'object' ) {
					options = null;
				}
	
				defaultOptions = resolveOptions( options );
			};
	
			return new constructor();
		})();
		
		// if cookies are supported by the browser
		if (cookie.test()) {
		
			store.addType( "cookie", function (key, value, options) {
				
				if ('undefined' === typeof key) {
					return cookie.get();
				}
		
				if ('undefined' === typeof value) {
					return cookie.get(key);
				}
				
				// Set to NULL means delete
				if (value === null) {
					cookie.del(key);
					return null;
				}
		
				return cookie.set(key, value, options);		
			});
		}
	}());
	
	// in-memory storage
	// fallback for all browsers to enable the API even if we can't persist data
	(function() {
		var memory = {},
			timeout = {};
	
		function copy( obj ) {
			return obj === undefined ? undefined : store.parse( store.stringify( obj ) );
		}
	
		store.addType( "memory", function( key, value, options ) {
			
			if ( !key ) {
				return copy( memory );
			}
	
			if ( value === undefined ) {
				return copy( memory[ key ] );
			}
	
			if ( timeout[ key ] ) {
				clearTimeout( timeout[ key ] );
				delete timeout[ key ];
			}
	
			if ( value === null ) {
				delete memory[ key ];
				return null;
			}
	
			memory[ key ] = value;
			if ( options.expires ) {
				timeout[ key ] = setTimeout(function() {
					delete memory[ key ];
					delete timeout[ key ];
				}, options.expires );
			}
	
			return value;
		});
	}() );

}( this ));