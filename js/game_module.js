import { shifumi_game } from './modules/shifumi_game.js';


class shifumi_item {
	constructor(item){
		this.__id = item.id;
		this.__name = item.name;
		this.__marshalledImage = item.marshalledImage;
		this.__image;
		this.__sampleArray = new Array();
		console.log(`\t \t building shifumi_item : ${this.__id} ${this.__name}`);
	}
	addSample(sampleImage){
		let img = new Image();
		img.src = sampleImage;
		this.__sampleArray.push(img);
	}
	display(){
		console.log(`\t shifumi_item : ${this.__id} ${this.__name}`);
	}
	unmarshallImage(){
		const image = new Image();
		return new Promise((resolve,reject)=>{
			image.addEventListener("load",()=>{
	      this.__image = image;
	      resolve();
	    });
	    image.addEventListener("error",()=>{
	      reject(`Caramba, cannot load ${this.__name}`);
	    });
	    image.src = this.__marshalledImage;
		});
	}
}

class shifumi_set extends Array {
	constructor(array){
		super();	

		for (let item of array){
			console.log(`\t building shifumi_set : ${item.__id} ${item.__name}`);
			this.push(new shifumi_item(item));
		}

		let promises = new Array();
	  for (let shifumi of this){
	    promises.push( shifumi.unmarshallImage() );
	  }
	  
	  this.__promises = Promise.all(promises);

	}
	async initialize(){
		const response = await this.__promises;
	}
	display(){
		console.log(`here is all my shifumi_items : `)
		for(let shifumi of this){
			shifumi.display();
		}
	}
	getAnyShifumiItem(){
		return (this)[Math.floor(Math.random()*(this).length)];
	}
	getShifumiByName(name){
		for (let item of this){
			if (item.__name == name) {return item;}
		}
	}
}




class myMessage{
	constructor(type,payload){
		this.type=type;
		this.payload=payload;
	}
}

let __shifumiSet;

async function start(){

	//Loading Models
	const classifier = knnClassifier.create();
  	let __net = await mobilenet.load();
  	console.log('Successfully loaded model');


  	let __parentDiv = document.getElementById("shifumiGame");
	

  	//VIDEO ELEMENT
		let __videoElement;
		 
	
        
    

  	//Training Button
  	let __trainingButton = document.createElement("Button");
  	__trainingButton.innerText = "Start Training";
  	__parentDiv.appendChild(__trainingButton);
  	__trainingButton.addEventListener("click",async ()=>{
  		
  		for (let item of __shifumiSet){
  			let cpt =0;
  			for (let img of item.__sampleArray){
  				cpt++;
  				let activation;
  				try{
  					// Get the intermediate activation of MobileNet 'conv_preds' and pass that
    				// to the KNN classifier.
    				activation = __net.infer(img, true);
    			}catch(err){
    				console.log("__net.infer :: " + err.name + ": " + err.message); 
    			}
    			try{
    				// Pass the intermediate activation to the classifier.
    				await classifier.addExample(activation, item.__name);
    			}catch(err){
    				console.log("classifier.addExample :: " + err.name + ": " + err.message); 
    			}
    			console.log(`Learning ${item.__name} sample ${cpt} of ${item.__sampleArray.length}`);
    		}		
  		}
  		const event = new Event("doneTraining");
  		window.dispatchEvent(event);
  	});


  	//When Training is Done
  	window.addEventListener("doneTraining",async ()=>{

  		__parentDiv.removeChild(__trainingButton);


  		//Launch Game
  		let myShifumiGame = new shifumi_game(__parentDiv, __shifumiSet);

			const webcam = await tf.data.webcam(myShifumiGame.__videoElement);
			while(true){
				if (classifier.getNumClasses() > 0) {
      				const img = await webcam.capture();

      				// Get the activation from mobilenet from the webcam.
      				const activation = __net.infer(img, 'conv_preds');
      
      				// Get the most likely class and confidence from the classifier module.
      				const result = await classifier.predictClass(activation);

      				const classes = ['Rock', 'Paper', 'Scissors'];
      				console.log(`
        				prediction: ${result.label}\n
        				probability: ${result.confidences[result.label]}
      				`);

      				//////

      				myShifumiGame.setHumanChoiceReco(result.label, result.confidences);	
      				///////


      				// Dispose the tensor to release the memory.
      				img.dispose();
    			}

    			// Give some breathing room by waiting for the next animation frame to fire.
    			await tf.nextFrame();
			}
		})

	//COMMUNICATION
	const shifumi_com_worker = new SharedWorker('./shifumi_com_worker.js');
	shifumi_com_worker.port.onmessage = async function(e){
		
		if(e.data.hasOwnProperty("type") ) {	
			console.log(`game.html has just received a ${e.data.type} message`);
			if(e.data.type == "getAllDAO_response") {
				console.log("From game.html here is the response "+e.data.payload);
				let tempArray = JSON.parse(e.data.payload);
				if(__shifumiSet === undefined) {
					__shifumiSet = new shifumi_set(tempArray);
					await __shifumiSet.initialize();
					console.log("ShifumiSet is initialized !");
				}else{
					console.log("From game.html : __shifumiSet is already defined");
				}
				__shifumiSet.display();
			}
			if(e.data.type == "sample") {
				console.log("From game.html, treating a sample for "+e.data.payload.name);
				__shifumiSet.getShifumiByName(e.data.payload.name).addSample(e.data.payload.img);
			}			
		}
	}
	let temp = new myMessage('getAllDAO_query');
	shifumi_com_worker.port.postMessage(temp);
}
	
window.addEventListener("DOMContentLoaded", start);