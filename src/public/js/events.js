function addGenerateDataEvent() {
    let btnGenerateData = document.querySelector('#btn-generate');
    btnGenerateData.addEventListener("click", function(e){
        e.preventDefault();
        Communicator.generateData();
    });    
}

function addStopProcessingEvent() {
    let btnStop = document.querySelector('#btn-stop');
    btnStop.addEventListener("click", function(e){
        e.preventDefault();
        Communicator.stopProcessing();
    });    
}

function addStartProcessingEvent() {
    let btnStop = document.querySelector('#btn-start');
    btnStop.addEventListener("click", function(e){
        e.preventDefault();
        Communicator.startProcessing();
    });    
}

addGenerateDataEvent();
addStartProcessingEvent();
addStopProcessingEvent();