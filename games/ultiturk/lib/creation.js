// Script loaded by creation.html

$(document).ready(function() {
			
	var node = parent.node,
		W = parent.W,
		GameState = node.GameState;
		
    W.noEscape(window);
     
    if (node.game.state.round === 1) {
    	document.getElementById('costWarn').innerHTML = '<strong>Important!!</strong> You will <strong>not</strong> be charged the investment costs in this round!';
    }
    
    $('#show_history').click(function() {
    	$('#show_history #switch_show').toggle();
 	    $('#show_history #switch_hide').toggle();
    	node.game.history_open = (node.game.history_open) ? true : false;
 	   $('#container_creation').toggle('slow', function() {
 		   
 	   });
 	    $('#container_history').toggle('slow', function() {
 	    	//
 	    });
	  
	});
    

    
    
    var spanCost = document.getElementById("cost");
    
    node.game.creaCosts = 0; // reset creation costs to 0;
    node.game.creaTimeUp = false; // reset "was last creation termineted by a TIMEUP?"
    
    var copy = 0;
    
    function addJQuerySliders(init) {
       $( "#cf_controls div.ui-slider" ).each(function() {
         // read initial values from markup and remove that
         var settings = init[this.id];
         if (settings) {
           settings.slide = settings.change = function(e, ui) {             
             if (copy <= 0) {
               var feat = this.id;
        	   var features = node.game.cf.controls.features; 

        	   var range = (features[feat].max - features[feat].min)*8;
        	   var oldValue = node.game.cf.getAllValues()[feat];
     	
        	   var newCost = Math.abs(ui.value - oldValue) / range;
        	   node.game.creaCosts += newCost;
        	   spanCost.innerHTML = node.game.creaCosts.toFixed(2);
             }
             else {
            	 copy--;
             }
             node.emit('CF_CHANGE');
             
           };
           $( this ).slider(settings);
         }
       });
    };
    
  
    node.on('COPIED', function(f) {
      //node.game.personal_history.add(f);
    	node.game.creaCosts += node.game.copyCOST;
        spanCost.innerHTML = node.game.creaCosts.toFixed(2);
        
        copy = 13; // number of parameters to modify
        
    	node.game.cf.draw(f);
    	addJQuerySliders(CFControls.normalizeFeatures(f), false);
    	
    	 $('#show_history').click();
    });
   
    // Initialize Chernoff Face
    ////////////////////////////
   
    // If we play the first round we start
    // with a random face, otherwise with 
    // the last one created
    if (!node.game.last_cf) {
      var init_cf = node.widgets.widgets.ChernoffFaces.FaceVector.random();
      //console.log(init_cf);
      
      // some features are fixed in the simplified version
      init_cf = CFControls.pinDownFeatures(init_cf);
      
      //console.log('After');
      //console.log(init_cf);
    }
    else {
      var init_cf = node.game.last_cf;
    }

    // Important
    // Set the player color
    init_cf.color = node.player.color;
    
    var init_sc = CFControls.normalizeFeatures(init_cf);
    
     
      var sc_options = {
        id: 'cf_controls',
        features: init_sc,
        change: 'CF_CHANGE'
      };
    
      var cfc = new CFControls(sc_options);
     		
      var cf_options = { id: 'cf',
                 width: 500,
                 height: 500,
                 features: init_cf,
                 controls: cfc
      };
      
     var creationDiv = document.getElementById('creation');
     node.game.cf = node.widgets.append('ChernoffFacesSimple', creationDiv, cf_options);
     //node.game.cf = node.widgets.append('ChernoffFaces', creationDiv, cf_options);
		 
     // Copy face_0
     if (node.game.state.roind === 1) {
    	 node.set('CF_0', node.game.cf.getAllValues());
     }
     
     // Adding the jQuery sliders
     ////////////////////////////
     addJQuerySliders(init_sc);

     
  
      
     // History of previous exhibits
     ///////////////////////////////
     
     var historyDiv = document.getElementById('history');

     if (node.game.all_ex.length > 0) {
        node.game.all_ex.parse();
        historyDiv.appendChild(node.game.all_ex.getRoot());  
     }
     else {
       historyDiv.appendChild(document.createTextNode('No past exhibitions yet.'));
     }
    
      
      // Submission
      //////////////
      
      
      $('#done_box button').click(function(){
        $(function() {
            // Notify the game engine that the button has been
            // clicked. This way any other jQuery dialog can 
            // get closed
            node.emit('CLICKED_DONE');
            node.emit('DONE');
          });
      });
      
      
      
      // Tooltip for enlarge and copy canvas
      //////////////////////////////////////
      
      $( '#all_ex canvas').hover(
              function (e) {
                var enlarge = $("<span id='enlarge'>Click to enlarge, and decide if copying it</span>");
                var pos = $(this).position();
                enlarge.addClass('tooltip');
                enlarge.css({"left": (5 + e.pageX) + "px","top":e.pageY + "px" });
                  $(this).before(enlarge);
                  $(this).mousemove(function(e){
                        $('span#enlarge').css({"left": (5 + e.pageX)  + "px","top":e.pageY + "px" });
                     }); 
              }, 
              function () {
                $(this).parent().find("span#enlarge").remove();
                $(this).unbind('mousemove');
          });

      
      
      
      // AUTOPLAY
      ////////////
      node.env('auto', function(){
    	  node.random.exec(function() {
    		  var ex, button;
    		  
    		  if (node.player.color === 'green') {
    			  
    			  if (node.game.state.round % 2 === 1) {
    				  ex = 'ex_A';  
    			  }
    			  else {
    				  ex = 'ex_B';
    			  }
    		  }
    		  
    		  if (node.player.color === 'red') {
    	            
    			  if (node.game.state.round % 2 === 1) {
    				  ex = 'ex_B';
    			  }
    			  else {
    				  ex = 'ex_C';
    			  }
    		  }
    		  
    		  if (node.player.color === 'black') {
              
    			  if (node.game.state.round % 2 === 1) {
    				  ex = 'ex_C';
              }
    			  else {
    				  ex = 'ex_A';  
    			  }
    		  }
    		  
//    		  var choice = Math.random();
//    		
//    		  
//    		  if (choice < 0.33) {
//    			  ex = 'ex_A';  
//    		  }
//    		  else if (choice < 0.66) {
//    			  ex = 'ex_B';
//    		  }
//    		  else {
//    			  ex = 'ex_C';
//    		  }  
    			
    		  button = node.window.getElementById(ex);
    		
    		  if (button) {
    			  button.click();
    		  }
    		  else {
    			  setTimeout(function(){
    				  button = node.window.getElementById(ex);
    				  if (!button) {
    					  setTimeout(this, 1000);
    				  }
    				  else {
    					  button.click();
    				  }
    			  }, 1000);
    		  }
    		  
	      }, 4000);
      });
       
			
});