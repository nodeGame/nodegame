/**
 * # Antechamber for Ultimatum Game
 * Copyright(c) 2013 Stefano Balietti
 * MIT Licensed
 *
 * Incoming connections are validated:
 *
 * - Authorization
 * - Browser requirements
 *
 * On success, clients are sent to the real waiting room.
 * ---
 */
(function waiting2start() {
    
     // Refreshing the dots...
        setInterval(function(){
            if (wait.innerHTML !== '......') {
                wait.innerHTML = wait.innerHTML + '.';  
            }
            else {
                wait.innerHTML = '..';
            }
        }, 1000);    
	  
        node.on.pconnect(function(msg) {
            var minPlayers = node.game.plot.getProperty('minPlayers')[0];
    	    span_connected.innerHTML = node.game.pl.size() + ' / ' minPlayers;  
        });
        
});