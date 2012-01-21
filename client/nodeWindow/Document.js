(function(node) {
	
	/*!
	 * Document
	 * 
	 */
	
	// Create the window obj
	node.window = {};
	
	// Note: this will be erased, when the GameWindow obj will be created
	node.window.Document = Document;
	
	function Document() {};
	
	Document.prototype.addButton = function (root, id, text, attributes) {
		var sb = document.createElement('button');
		sb.id = id;
		sb.appendChild(document.createTextNode(text || 'Send'));	
		this.addAttributes2Elem(sb, attributes);
	
		root.appendChild(sb);
		return sb;
	};
	
	Document.prototype.addFieldset = function (root, id, legend, attributes) {
		var f = this.addElement('fieldset', root, id, attributes);
		var l = document.createElement('Legend');
		l.appendChild(document.createTextNode(legend));	
		f.appendChild(l);
		root.appendChild(f);
		return f;
	};
	
	Document.prototype.addTextInput = function (root, id, attributes) {
		var mt =  document.createElement('input');
		mt.id = id;
		mt.setAttribute('type', 'text');
		this.addAttributes2Elem(mt, attributes);
		root.appendChild(mt);
		return mt;
	};
	
	Document.prototype.addCanvas = function (root, id, attributes) {
		var canvas = document.createElement('canvas');
		var context = canvas.getContext('2d');
			
		if (!context) {
			alert('Canvas is not supported');
			return false;
		}
		
		canvas.id = id;
		this.addAttributes2Elem(canvas, attributes);
		root.appendChild(canvas);
		return canvas;
	};
		
	Document.prototype.addSlider = function (root, id, attributes) {
		var slider = document.createElement('input');
		slider.id = id;
		slider.setAttribute('type', 'range');
		root.appendChild(slider);
		this.addAttributes2Elem(slider, attributes);
		return slider;
	};
	
	
	Document.prototype.addRadioButton = function (root, id, attributes) {
		var radio = document.createElement('input');
		radio.id = id;
		radio.setAttribute('type', 'radio');
		root.appendChild(radio);
		this.addAttributes2Elem(radio, attributes);
		return radio;
	};
	
	Document.prototype.addJQuerySlider = function (root, id, attributes) {
		var slider = document.createElement('div');
		slider.id = id;
		slider.slider(attributes);
		root.appendChild(slider);
		return slider;
	};
	
	
	Document.prototype.addLabel = function (root, id, labelText, forElem, attributes) {
		var label = document.createElement('label');
		label.id = id;
		label.appendChild(document.createTextNode(labelText));	
		label.setAttribute('for', forElem);
		this.addAttributes2Elem(label, attributes);
		
//		var root = node.window.getElementById(forElem);
		root.parentNode.insertBefore(label,root);
		
		return label;
		
//		// Add the label immediately before if no root elem has been provided
//		if (!root) {
//			var root = node.window.getElementById(forElem);
//			root.insertBefore(label);
//		}
//		else {
//			root.appendChild(label);
//		}
//		return label;
	};
	
	Document.prototype.addSelect = function (root, id, attributes) {
		return this.addElement('select', root, id, attributes);
	};
	
	Document.prototype.populateSelect = function (select,list) {
		
		for (var key in list) {
			if (list.hasOwnProperty(key)) {
				var opt = document.createElement('option');
				opt.value = list[key];
				opt.appendChild(document.createTextNode(key));
				select.appendChild(opt);
			}
		}
	};
	
	Document.prototype.write = function (root, text) {
		if (!root) return;
		if (!text) return;
		var tn = document.createTextNode(text);
		node.log('ROOT');
		node.log(root);
		node.log('TEXT');
		node.log(text);
		root.appendChild(tn);
		return tn;
	};
	
	Document.prototype.writeln = function (root, text, rc) {
		if (!root) return;
		var br = this.addBreak(root, rc);
		return (text) ? Document.prototype.write(root, text) : br;
	};
	
	// IFRAME
	
	Document.prototype.addIFrame = function (root, id, attributes) {
		var attributes = {'name' : id}; // For Firefox
		return this.addElement('iframe', root, id, attributes);
	};
	
	
	// BR
	
	Document.prototype.addBreak = function (root, rc) {
		var RC = rc || 'br';
		var br = document.createElement(RC);
		return root.appendChild(br);
		//return this.insertAfter(br,root);
	};
	
	// CSS
	
	Document.prototype.addCSS = function (root, css, id, attributes) {
		
		var attributes = attributes || {'rel' : 'stylesheet',
										'type': 'text/css'};
		
		attributes.href = css;
		
		var id = id || 'maincss';
		
		return this.addElement('link', root, id, attributes);
	};
	
	
	Document.prototype.addDiv = function (root, id, attributes) {
		return this.addElement('div', root, id, attributes);
	};
	
	
	Document.prototype.highlight = function (elem, code) {
		if (!elem) return;
		
		// default value is ERR		
		switch (code) {	
			case 'OK':
				var color =  'green';
				break;
			case 'WARN':
				var color = 'yellow';
				break;
			default:
				var color = 'red';
		}
		
		return this.addBorder(elem,color);
	};
	
	Document.prototype.addBorder = function (elem, color, witdh, type) {
		if (!elem) return;
		
		var color = color || 'red';
		var width = width || '5px';
		var type = type || 'solid';
		
		var properties = { border: width + ' ' + type + ' ' + color }
		return this.style(elem,properties);
	};
	
	Document.prototype.style = function (elem, properties) {
		if (!elem || !properties) return;
		
		var style = '';
		for (var i in properties) {
			style += i + ': ' + properties[i] + '; ';
		};
		return elem.setAttribute('style',style);
	};
	
	// TODO: Potentially unsafe
	// Works only with Chrome
	Document.prototype.loadFile = function (container,file) {
		
		// Check for the various File API support.
		if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
		  node.log('The File APIs are not fully supported in this browser.', 'ERR');
		  return false;
		}
		function onInitFs(fs) {
		  node.log('Opened file system: ' + fs.name);
		}
		
		function errorHandler(e) {
			  var msg = '';
	
			  switch (e.code) {
			    case FileError.QUOTA_EXCEEDED_ERR:
			      msg = 'QUOTA_EXCEEDED_ERR';
			      break;
			    case FileError.NOT_FOUND_ERR:
			      msg = 'NOT_FOUND_ERR';
			      break;
			    case FileError.SECURITY_ERR:
			      msg = 'SECURITY_ERR';
			      break;
			    case FileError.INVALID_MODIFICATION_ERR:
			      msg = 'INVALID_MODIFICATION_ERR';
			      break;
			    case FileError.INVALID_STATE_ERR:
			      msg = 'INVALID_STATE_ERR';
			      break;
			    default:
			      msg = 'Unknown Error';
			      break;
			  }
	
			  node.log('Error: ' + msg, 'ERR');
		};
		
		// second param is 5MB, reserved space for storage
		window.requestFileSystem(window.PERSISTENT, 5*1024*1024, onInitFs, errorHandler);
		
			
		container.innerHTML += 'DONE FS';
		return container;
	};
	
	// Util
	
	Document.prototype.addElement = function (elem, root, id, attributes) {
		var e = document.createElement(elem);
		if (id) {
			e.id = id;
		}
		this.addAttributes2Elem(e, attributes);
		
		root.appendChild(e);
		return e;
	};
	
	Document.prototype.addAttributes2Elem = function (e, a) {
		
		for (var key in a) {
			if (a.hasOwnProperty(key)){
				if (key !== 'label') {
					e.setAttribute(key,a[key]);
				}
				else {
					// If a label element is present it checks whether it is an
					// object literal or a string.
					// In the former case it scans the obj for additional properties
					
					var labelId = 'label_' + e.id;
					var labelText = a.label;
					
					if (typeof(a[key]) === 'object') {
						var labelText = a.text;
						if (a.id) {
							labelId = a.id; 
						}
					}	
					this.addLabel(e, labelId, labelText, e.id);
				}
			}
		}
		return e;
	};
	
	Document.prototype.removeClass = function (element, className) {
		var regexpr = '/(?:^|\s)' + className + '(?!\S)/';
		element.className = element.className.replace( regexpr, '' );
	};

	
	Document.prototype.removeChildrenFromNode = function (e) {
		
	    if (!e) return false;
	    
	    while (e.hasChildNodes()) {
	        e.removeChild(e.firstChild);
	    }
	    return true;
	};
	
	Document.prototype.insertAfter = function (node, referenceNode) {
		  referenceNode.insertBefore(node, referenceNode.nextSibling);
	};

})(window.node);