// PlayerList.js TEST File

document.write('<script src="../client/PlayerList.js" charset="utf-8"></script>');

window.onload = function() {
	
	var mario = new Player(1241234,'mario');
	
	console.log(mario);
	console.log(mario.getConnid());
	console.log(mario.getName());
	console.log(mario.toString());
	
	console.log(JSON.stringify(mario));
	
	// 8 Players
	var list = {
			1241234: new Player(1241234,'mario'),
			3423423: new Player(3423423, 'luigi'),
			1893724: new Player(1893724, 'lapo'),
			9283722: new Player(9283722, 'mamma'),
			9082374: new Player(9082374, 'babbo'),
			1932000: new Player(1932000, 'zeroo'),
			8888333: new Player(8888333, 'otto'),
			7777777: new Player(7777777, 'settimio')
	};
	

	// Size Test
	console.log('\nSize Test\n');
	
	var pl = new PlayerList(list);
	console.log(pl);
	var listSize = pl.size;
	if (listSize !== 8) {console.log('Size Test Failed');};
	
	// Add Test
	console.log('\nAdd Test\n');
	
	pl.add('1111111', 'uno');
	console.log('PL Size: ' + pl.size);
	if (pl.size !== listSize+1) {console.log('Add Test Failed');};
	
	// Remove Test
	console.log('\nRemove Test\n');
	
	pl.remove('1111111');
	console.log('PL Size: ' + pl.size);
	if (pl.size !== listSize) {console.log('Remove Test Failed');};	
	
	// Get Test
	console.log('\nGet Test\n');
	
	var connid = 7777777;
	var p = pl.get(connid);
	console.log(p.toString());
	if (p.getConnid() !== connid){console.log("Get Test Failed");};
	
	// Get Random Test
	// Todo: improve
	console.log('\nGet Random Test\n');
	
	var pRnd = pl.getRandom();
	console.log(pRnd);
	if (typeof(pRnd)!=='object'){console.log('Get Random Test Failed');};	
	
	
	// Random Groups Test
	console.log('\nRandom Groups Test\n');
	
	var n = 4;
	var rndGroups = pl.getNGroups(n);
	console.log(rndGroups);
	if (rndGroups.length !== n) {var groupTest = false;};
	
	for (var i=0;i<n;i++) {
		if(typeof(rndGroups[i])!=='Object') {
			groupTest = false;
			break;
		}
	}	
	if (groupTest===false) {console.log('Random Group Test Failed');};

	
	// Map Test
	console.log('\nMap Test\n');
	
	var m = pl.map(function(o) {return o;});
	if (m.length !== listSize) {console.log('Map Test Failed');};

	// ForEach Test
	console.log('\nforEach Test\n');
	
	var forEachMap = Array();
	pl.forEach(function(o){
		forEachMap.push(o.getConnid());	
	});
	
	if (forEachMap.length !== listSize) {console.log('ForEach Test Failed');};
	
	
	// Get All IDs Test
	console.log('\nGet All Ids Test\n');
	
	var allids = pl.getAllIDs();	
	console.log('AllIds: \n' + allids);
	if (allids.length !== listSize) {console.log('Get All Ids Test Failed');};

	
};