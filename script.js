let timer;
let time = 0;
let currentSet = 0;
let totalSets = 0;
let isRunning = false;
let workoutState = 'rest';
let workoutType = '';
let customWorkout = {};
const timeDisplay = document.getElementById('timeDisplay');
const stateDisplay = document.getElementById('stateDisplay');
const timerSection = document.getElementById('timer-section');

function redirectTo(section) {
    console.log(`Redirecting to section: ${section}`);
    
    // Clear the active timer if the user goes back to the menu
    if (section === 'menu') {
        clearInterval(timer);  // Reset the active interval
        isRunning = false;  // Ensure no timer is running
        console.log('Timer cleared and reset on redirect to menu');
    }

    // Hide all sections and show the target section
    document.querySelectorAll('.menu-container, .workout-container, #timer-section').forEach(div => {
        div.style.display = 'none';
    });

    if (section === 'menu') {
        document.querySelector('.menu-container').style.display = 'block';
    } else if (section === 'quick-workouts' || section === 'custom-workout') {
        document.getElementById(section).style.display = 'block';
    } else if (section === 'timer-section') {
        document.getElementById('timer-section').style.display = 'block';
    }
}

function startWorkout(type) {
    console.log(`Starting quick workout: ${type}`);
    workoutType = type;
    totalSets = 1; // Default for predefined workouts
    currentSet = 0;
    if (type === 'seven-minutes') {
        customWorkout = { active: 60, switchTime: 0, rest: 15, sets: 7 };
    } else if (type === 'hiit') {
        customWorkout = { active: 30, switchTime: 10, rest: 30, sets: 5 };
    }
    else if (type === 'study-session') {
        customWorkout = { active: 15*60, switchTime: 0, rest: 15 * 60, sets: 1 }; // Study for 15 mins, 15 min break
    }
    startTimer();
}

function startCustomWorkout() {
    console.log('Starting custom workout');
    const active = parseInt(document.getElementById('activeTime').value);
    const switchTime = parseInt(document.getElementById('switchTime').value) || 0;
    const rest = parseInt(document.getElementById('restTime').value);
    const sets = parseInt(document.getElementById('numSets').value);
    customWorkout = { active, switchTime, rest, sets };
    totalSets = sets;
    currentSet = 0;
    startTimer();
}

function startTimer() {
    console.log('Starting timer');
    isRunning = true;
    redirectTo('timer-section');
    currentSet = 0;
    nextSet();  // Begin the first set
}

function nextSet() {
    if (currentSet >= totalSets) {
        resetTimer();
        return; 
    }
    console.log(`Set ${currentSet + 1} of ${totalSets}`);
    currentSet++;
    time = 0;
    workoutState = 'active'; // Begin with active stage for each set
    updateDisplay();
    timer = setInterval(updateTimeContinuously, 100); // Use a continuous update interval of 100ms
}
function updateTimeContinuously() {
    let totalDuration;

    if (workoutState === 'active') {
        totalDuration = customWorkout.active;
    } else if (workoutState === 'break') {
        totalDuration = customWorkout.switchTime;
    } else if (workoutState === 'rest' && customWorkout.rest > 0)  {
        totalDuration = customWorkout.rest;
    }else {
        totalDuration = 0; 
    }

    time += 0.1;  // Increment time by 100ms (0.1 seconds)
    updateDisplay();  // Update the visual display every 100ms

    if (time >= totalDuration) {
        clearInterval(timer);  // Clear the timer before switching to the next stage
        
        if (workoutState === 'active' && customWorkout.switchTime > 0) {
            // Transition from active to break if a switch time is set
            workoutState = 'break';
            time = 0;
            timer = setInterval(updateTimeContinuously, 100);  // Continue with the break stage
        } else if (workoutState === 'active' || workoutState === 'break') {
            // Transition from break or active to rest
            workoutState = 'rest';
            time = 0;
            timer = setInterval(updateTimeContinuously, 100);  // Continue with the rest stage
        } else if (workoutState === 'rest') {
            // After rest, move to the next set
            nextSet();
        }
    }
}

function resetTimer() {
    console.log('Resetting timer');
    clearInterval(timer);
    time = 0;
    workoutState = 'rest';
    updateDisplay();
    redirectTo('menu');
}

function updateDisplay() {
    let minutes = Math.floor(time / 60);
    let seconds = Math.floor(time % 60);
    let milliseconds = Math.floor((time % 1) * 100);  // Convert fractional seconds to milliseconds

    // Display in the format 00:00:000
    timeDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(milliseconds).padStart(2, '0')}`;
    stateDisplay.textContent = workoutState.charAt(0).toUpperCase() + workoutState.slice(1);
    const setDisplay = document.getElementById('setDisplay');
    setDisplay.textContent = `Set ${currentSet}/${totalSets}`;
    timerSection.className = workoutState;  // Apply background color based on workout state

    // Determine the correct totalDuration for the current state
    let totalDuration;
    if (workoutState === 'active') {
        totalDuration = customWorkout.active;
    } else if (workoutState === 'break') {
        totalDuration = customWorkout.switchTime;
    } else if (workoutState === 'rest') {
        totalDuration = customWorkout.rest;
    }

    if (!totalDuration || isNaN(totalDuration)) {
        console.error("Invalid totalDuration:", totalDuration);
        return;
    }

    // Update progress circle
    let circle = document.querySelector('svg circle');
    let radius = circle.r.baseVal.value;
    let circumference = 2 * Math.PI * radius;

    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = `${circumference}`;

    let progress = (time / totalDuration) * circumference;
    circle.style.strokeDashoffset = `${circumference - progress}`;
}
