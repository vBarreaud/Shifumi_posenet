// shifumi_com_worker.js
let myPorts = new Array();



class myMessage{
	constructor(type,payload){
		this.type=type;
		this.payload=payload;
	}
}

self.addEventListener("connect",connectCB);

function connectCB(e) {
	myPorts.push(e.ports[0]);
 
	for(let port of myPorts){
		port.onmessage = trainingGame_router;
	}
	e.ports[0].start();
	console.log(`COM worker has just received a connection request! ${myPorts.length}`);
  
	

};




function trainingGame_router(e){
  	
  	if(e.data.hasOwnProperty("type") ) {
			if(e.data.type == "getAllDAO_query") {
				
				for(let port of myPorts){
					port.postMessage(e.data);
				}
				
			}
			if(e.data.type == "getAllDAO_response") {
				
				for(let port of myPorts){
					port.postMessage(e.data);
				}
				
			}
			if(e.data.type == "sample") {
				
				for(let port of myPorts){
					port.postMessage(e.data);
				}
				
			}

		}else{
			console.log(`COM Worker : Receiving unknown Message : ${e.data}`);	
		}
}
