
/***************** Similar Tasks *******************/
// Function to check if taskA a subset of taskB?
function isSubset(taskA, taskB){
    const wordsA = taskA.split(' ');
    const wordsB = taskB.split(' ');
    return wordsA.every(val => wordsB.includes(val));
}

function getTasksSubsetList(tasks){
    tasksSubset = {};
    for(let i = 0; i<tasks.length; i++){
        for(let j = i+1; j<tasks.length; j++){
            if(isSubset(tasks[j].title, tasks[i].title)){
                if(!tasksSubset[tasks[i].id])
                    tasksSubset[tasks[i].id]= [tasks[j].id];
                else
                    tasksSubset[tasks[i].id].push(tasks[j].id)
            }
            else if(isSubset(tasks[i].title, tasks[j].title))
            {
                if(!tasksSubset[tasks[j].id])
                    tasksSubset[tasks[j].id]= [tasks[i].id];
                else
                    tasksSubset[tasks[j].id].push(tasks[i].id)
            }
        }
    }
    return tasksSubset;
}

function deleteReferredKeys(tasksSubset){
    let tasks = {...tasksSubset}
    for(key of Object.keys(tasks)){
        if(tasks[key])
        {
            for(subsetKeys of tasks[key]){
            delete tasks[subsetKeys];
            }
        }
    };
    return tasks
}

function createSimilarTasksArray(tasksSubset){
    let similarTasksArray = []
    for(key of Object.keys(tasksSubset)){
        let array = tasksSubset[key]
        array.push(parseInt(key))
        similarTasksArray.push(array)
    };
    return similarTasksArray;
}

function getSimilarTasksService(tasks){
    let tasksSubset = getTasksSubsetList(tasks);
    tasksSubset = deleteReferredKeys(tasksSubset);
    return createSimilarTasksArray(tasksSubset);
}

module.exports = {getSimilarTasksService}