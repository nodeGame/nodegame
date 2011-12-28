(function (exports) {
	

	/**
	 * Controls
	 * 
	 */
	
	exports.Controls = Controls;	
	exports.Controls.Slider = SliderControls;
	exports.Controls.Radio	= RadioControls;
	
		
	function Controls (options) {
		this.name = 'Controls'
		this.version = '0.2';
	

		this.options = options;
		this.id = options.id || this.name;
		this.root = null;
		
		this.listRoot = null;
		this.fieldset = null;
		this.submit = null;
		
		this.init(options);
	};

	Controls.prototype.add = function (root, id, attributes) {
		// TODO: node.window.addTextInput
		//return node.window.addTextInput(root, id, attributes);
	};
	
	Controls.prototype.init = function (options) {
//		if (options.fieldset) {
//			this.list = new node.window.List();
//		}
//		else {		
//			this.list = new node.window.List(this.id);
//		}
		this.hasChanged = false; // TODO: should this be inherited?
		this.changeEvent = options.change || this.id + '_change';
		this.list = new node.window.List(options);
		this.listRoot = this.list.getRoot();
		
		if (!options.features) return;
		
		this.features = options.features;
		this.populate();
	};
	
	Controls.prototype.append = function (root) {
		this.root = root;
		var toReturn = this.listRoot;
		
//		if (this.options.fieldset) {
//			var idFieldset = this.options.fieldset.id || this.id;
//			var legend = this.options.fieldset.legend || 'Input';
//			var attributes = this.options.fieldset.attributes || {}; 
//			this.fieldset = node.window.addFieldset(this.root, idFieldset, legend, attributes);
//			// Updating root and return element
//			root = this.fieldset;
//			toReturn = this.fieldset;
//		}
		
		root.appendChild(this.listRoot);
		
		if (this.options.submit) {
			var idButton = 'submit_' + this.id;
			if (this.options.submit.id) {
				var idButton = this.options.submit.id;
				delete this.options.submit.id;
			}
			this.submit = node.window.addButton(root, idButton, this.options.submit, this.options.attributes);
			
			var that = this;
			this.submit.onclick = function() {
				if (that.options.change) {
					node.emit(that.options.change);
				}
			};
		}		
		
		return toReturn;
	};
	
	
	Controls.prototype.populate = function () {
		var that = this;
		
		for (var key in this.features) {
			if (this.features.hasOwnProperty(key)) {
				// Prepare the attributes vector
				var attributes = this.features[key];
				var id = key;
				if (attributes.id) {
					var id = attributes.id;
					delete attributes.id;
				}
				
				var item = this.list.createItem();
				this.listRoot.appendChild(item);
					
				// Add a different element according to the subclass instantiated
				var elem = this.add(item, id, attributes);
				
				// Fire the onChange event, if one defined
				if (this.changeEvent) {
					elem.onchange = function() {
						node.emit(that.changeEvent);
					};
				}
				
				// If a label element is present it checks whether it is an
				// object literal or a string.
				// In the former case it scans the obj for additional properties
//				if (attributes.label) {
//					var labelId = 'label_' + id;
//					var labelText = attributes.label;
//					
//					if (typeof(attributes.label) === 'object') {
//						var labelText = attributes.label.text;
//						if (attributes.label.id) {
//							labelId = attributes.label.id; 
//						}
//					}	
//					node.window.addLabel(elem, labelId, labelText, id);
//				}
			}
		}
	};
	
	Controls.prototype.listeners = function() {	
		var that = this;
		// TODO: should this be inherited?
		node.on(this.changeEvent, function(){
			that.hasChanged = true;
		});
				
	};
	
	Controls.prototype.getAllValues = function() {
		var out = {};
		for (var key in this.features) {	
			if (this.features.hasOwnProperty(key)) {
				var el = node.window.getElementById(key);
				if (el) {
//					node.log('KEY: ' + key, 'DEBUG');
//					node.log('VALUE: ' + el.value, 'DEBUG');
					out[key] = Number(el.value);
				}
				
			}
		}
		
		return out;
	};
	
	Controls.prototype.highlight = function (code) {
		return node.window.highlight(this.listRoot, code);
	};
	
	// Sub-classes
	
	SliderControls.prototype.__proto__ = Controls.prototype;
	SliderControls.prototype.constructor = SliderControls;
	
	function SliderControls (options) {
		Controls.call(this,options);
		this.name = 'SliderControls'
		this.version = '0.2';
		this.id = options.id || this.name;
	};
	
	SliderControls.prototype.add = function (root, id, attributes) {
		return node.window.addSlider(root, id, attributes);
	};
	
	RadioControls.prototype.__proto__ = Controls.prototype;
	RadioControls.prototype.constructor = RadioControls;
	
	function RadioControls (options) {
		Controls.call(this,options);
		this.name = 'RadioControls'
		this.version = '0.1.1';
		this.id = options.id || this.name;
		this.groupName = options.name || Math.floor(Math.random(0,1)*10000); 
		//alert(this.groupName);
	};
	
	RadioControls.prototype.add = function (root, id, attributes) {
		console.log('ADDDING radio');
		console.log(attributes);
		// add the group name if not specified
		if ('undefined' === typeof attributes.name) {
			console.log(this);
			console.log('MODMOD ' + this.groupName);
			attributes.name = 'asdasd'; //this.groupName;
		}
		console.log(attributes);
		return node.window.addRadioButton(root, id, attributes);	
	};
	
	// Override getAllValues for Radio Controls
	RadioControls.prototype.getAllValues = function() {
		
		for (var key in this.features) {
			if (this.features.hasOwnProperty(key)) {
				var el = node.window.getElementById(key);
				if (el.checked) {
					return el.value;
				}
			}
		}
		return false;
	};
	
})(node.window.widgets);