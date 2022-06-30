// create db connection 
let db;
// establish a connection to IndexedDB
const request = indexedDB.open('budget_tracker_pwa',1)

request.onupgradeneeded = function(event){
    const db = event.target.result;
    db.createObjectiveStore('new_transaction',{autoIncrement:true});
};

request.onsuccess = function(event){
    db=event.target.result;
    if(navigator.onLine){
        uploadTransaction();
    }
};

request.onerror= function(event){
    console.log(event.target.errorCode);
};


function recordSave(record){
    const transaction = db.transaction(['new_transaction'],'readwrite');
    const budgetObjectiveStore = transaction.objectStore('new_transaction');
    budgetObjectiveStore.add(record)
};

function popTransaction(){
    const transaction = db.transaction(['new_transaction'],'readwrite');
    const budgetObjectiveStore = transaction.objectStore('new_transaction');
    const grabAll = budgetObjectiveStore.getAll();

    grabAll.onsuccess=function(){
        if(grabAll.result.length > 0){
            fetch('/api/transaction',{
                method:'POST',
                body: JSON.stringify(grabAll.result),
                headers:{
                    Accept:'application/json, text/plain, */*',
                    'Content-Type':'application/json'
                }
            })
            .then(res =>res.json())
            .then(serverRes => {
                if(serverRes.message){
                    throw new Error(serverRes);
                }
                // open more transaction
                const transaction = db.transaction(['new_transaction'],'readwrite');
                const budgetObjectiveStore = transaction.objectStore('new_transaction');
                budgetObjectiveStore.clear();
                alert('All saved transactions have been submitted');
            })
            .catch(err =>{
                console.log(err)
            });
        }
    }
}

window.addEventListener('online', popTransaction);