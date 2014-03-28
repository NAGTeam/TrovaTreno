function addTreno(t){
	counter = localforage.getItem(0);
	localforage.setItem(0,++counter,function(){
		console.log('incrementato');
	});
	localforage.setItem(counter, t, function(){
		console.log('added');
	});
}

function initDB(){
	localforage.setItem(0,0, function(){
		console.log('data initializied');
	});
}
