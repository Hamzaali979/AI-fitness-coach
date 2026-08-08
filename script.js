const KEY="fitaiProfile";
let state=JSON.parse(localStorage.getItem(KEY)||"null");
let selectedGoal="";

const habits=[
 ["waterHabit","💧","Hydration","Drink water regularly"],
 ["workoutHabit","🏋️","Workout","Complete today's session"],
 ["mealHabit","🥗","Balanced meals","Follow your meal structure"],
 ["sleepHabit","😴","Recovery","Protect your sleep routine"],
 ["stepsHabit","🚶","Daily movement","Get some easy movement"],
 ["stretchHabit","🧘","Mobility","Do 5 minutes of mobility"]
];

const exercises=[
 ["Bodyweight Squat","🦵","Legs","Strength"],
 ["Push-up","💪","Chest / triceps","Strength"],
 ["Reverse Lunge","🦵","Legs","Strength"],
 ["Glute Bridge","🍑","Glutes","Strength"],
 ["Backpack Row","🏋️","Back","Strength"],
 ["Plank","🧱","Core","Core"],
 ["Dead Bug","🛡️","Core","Core"],
 ["Jumping Jack","⚡","Full body","Cardio"],
 ["Brisk Walk","🚶","Full body","Cardio"],
 ["Mountain Climber","🔥","Core / cardio","Cardio"],
 ["Bird Dog","🐕","Core / balance","Mobility"],
 ["Calf Raise","🦶","Calves","Strength"]
];

function $(id){return document.getElementById(id)}
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function toast(msg){$("toast").textContent=msg;$("toast").classList.add("toast-show");setTimeout(()=>$("toast").classList.remove("toast-show"),2200)}
function showToast(msg){toast(msg)}

function nextOnboard(n){
  const steps=[1,2,3];
  if(n===2 && (!$("oName").value.trim() || !$("oAge").value)) return toast("Add your name and age first.");
  if(n===3 && (!$("oHeight").value || !$("oWeight").value)) return toast("Add your height and weight first.");
  document.querySelectorAll(".onboard-step").forEach(x=>x.classList.add("hidden"));
  $("onboardStep"+n).classList.remove("hidden");
  document.querySelectorAll(".step").forEach((x,i)=>x.classList.toggle("active",i<n));
}
function selectGoal(btn){
  document.querySelectorAll(".goal-choice").forEach(x=>x.classList.remove("selected"));
  btn.classList.add("selected"); selectedGoal=btn.dataset.goal;
}
function finishSetup(){
  if(!selectedGoal)return toast("Choose a fitness goal.");
  state={
    name:$("oName").value.trim(),age:+$("oAge").value,sex:$("oSex").value,
    height:+$("oHeight").value,weight:+$("oWeight").value,
    activity:$("oActivity").value,goal:selectedGoal,water:0,streak:0,
    workouts:0,habits:{}
  };
  save(); loadApp();
}
function loadApp(){
  if(!state){$("onboarding").classList.remove("hidden");$("app").classList.add("hidden");return}
  $("onboarding").classList.add("hidden");$("app").classList.remove("hidden");
  $("sideName").textContent=state.name;$("helloName").textContent=state.name;
  $("avatar").textContent=state.name[0].toUpperCase();$("topAvatar").textContent=state.name[0].toUpperCase();
  updateAll();
}
function go(page){
  document.querySelectorAll(".page").forEach(p=>p.classList.add("hidden"));
  $("page-"+page).classList.remove("hidden");
  document.querySelectorAll(".nav").forEach(n=>n.classList.toggle("active",n.dataset.page===page));
  const titles={dashboard:"Dashboard",coach:"AI Coach",workout:"Workout",nutrition:"Nutrition",habits:"Daily Habits",progress:"Progress",library:"Exercise Library"};
  $("pageTitle").textContent=titles[page];
  if(page==="coach") setTimeout(()=>$("chatInput").focus(),50);
}
function calcBMI(){
  const m=state.height/100,b=state.weight/(m*m);
  $("bmi").textContent=b.toFixed(1);
  $("snapBMI").textContent=b.toFixed(1);
  $("bmiLabel").textContent=b<18.5?"Below range":b<25?"Healthy range":b<30?"Above range":"High BMI";
}
function calcCalories(){
  let bmr=state.sex==="male"?(10*state.weight+6.25*state.height-5*state.age+5):(10*state.weight+6.25*state.height-5*state.age-161);
  let mult={low:1.25,moderate:1.45,high:1.65}[state.activity]||1.45;
  let cal=Math.round(bmr*mult);
  if(state.goal==="fatloss")cal-=250;
  if(state.goal==="muscle")cal+=200;
  $("calories").textContent=cal;$("nutritionCalories").textContent=cal;
  $("proteinTarget").textContent=Math.round(state.weight*(state.goal==="muscle"?1.6:1.2))+" g/day";
}
function goalInfo(){
  const x={
    muscle:["Strength & muscle building","Follow progressive strength work, eat balanced meals and prioritize recovery."],
    fatloss:["Healthy weight management","Build consistent movement and balanced eating habits. Avoid crash diets."],
    fitness:["Overall fitness","Combine strength, cardio, mobility and recovery for a well-rounded routine."],
    maintain:["Maintain healthy habits","Keep your activity, food, hydration and recovery consistent."]
  }[state.goal];
  $("goalTitle").textContent=x[0];$("goalDesc").textContent=x[1];$("snapGoal").textContent=x[0];
}
function habitHTML(target){
  return habits.map(h=>`<label class="habit-row"><input class="habit-check" type="checkbox" ${state.habits[h[0]]?"checked":""} onchange="toggleHabit('${h[0]}')"><span>${h[1]}</span><div><b>${h[2]}</b><small>${h[3]}</small></div></label>`).join("");
}
function renderHabits(){
  $("dashHabits").innerHTML=habitHTML();
  $("fullHabits").innerHTML=habitHTML();
  const done=Object.values(state.habits).filter(Boolean).length, pct=Math.round(done/habits.length*100);
  $("dashPercent").textContent=pct+"%";$("dashBar").style.width=pct+"%";
  $("habitBigPercent").textContent=pct+"%";$("habitBigBar").style.width=pct+"%";
  $("habitSummary").textContent=`${done} of ${habits.length} completed`;
  $("progressPercent").textContent=pct+"%";$("circleProgress").style.width=pct+"%";$("goalRing").style.setProperty("background",`conic-gradient(var(--green) ${pct*3.6}deg,#1c252d 0deg)`);
}
function toggleHabit(k){
  state.habits[k]=!state.habits[k];save();renderHabits();
  const done=Object.values(state.habits).filter(Boolean).length;
  if(done===habits.length && state.streak<999){state.streak++;save();toast("Perfect day! Streak increased 🔥")}
  updateProgressStats();
}
function addWater(){if(state.water<8)state.water++;save();updateAll();toast(state.water===8?"Water goal complete 💧":"Water logged")}
function resetWater(){state.water=0;save();updateAll()}
function completeWorkout(){state.workouts++;state.habits.workoutHabit=true;save();updateAll();toast("Workout completed. Great job!")}
function updateProgressStats(){
 $("water").textContent=state.water;$("water2").textContent=state.water;$("streak").textContent=state.streak;
 $("snapWater").textContent=state.water+" / 8";$("snapStreak").textContent=state.streak+" days";$("snapWorkouts").textContent=state.workouts;
}
function renderWorkout(){
 const muscle=state.goal==="muscle";
 const cards=[
  ["Today's Full Body","⚡",[
   ["Warm-up walk","5 min"],["Squat","3 × 10"],["Push-up","3 × 8"],["Backpack row","3 × 10"],["Plank","3 × 30 sec"]]],
  ["Conditioning","🔥",[
   ["Brisk walk","15–20 min"],["Jumping jack","3 × 20"],["Reverse lunge","3 × 8/side"],["Mobility","5 min"]]]
 ];
 if(muscle)cards[0][2]=[["Warm-up","5 min"],["Squat","3 × 8–12"],["Push-up","3 × 8–12"],["Backpack row","3 × 10–12"],["Glute bridge","3 × 12"]];
 $("workoutPlan").innerHTML=cards.map(c=>`<article class="workout-card"><div class="ai-orb">${c[1]}</div><h3>${c[0]}</h3><p>Suggested session · adjust difficulty to your level.</p>${c[2].map(e=>`<div class="exercise"><span>${e[0]}</span><b>${e[1]}</b></div>`).join("")}</article>`).join("");
}
function renderMeals(){
 const meals=[
  ["Breakfast","🍳","Eggs or yogurt + oats/whole grain + fruit","Protein + carbs"],
  ["Lunch","🥗","Chicken/fish/beans + vegetables + rice/roti","Balanced plate"],
  ["Snack","🥜","Fruit + yogurt or nuts","Simple snack"],
  ["Dinner","🍗","Protein + vegetables + rice/roti/potato","Balanced dinner"]
 ];
 $("mealPlan").innerHTML=meals.map(m=>`<article class="meal"><div class="meal-icon">${m[1]}</div><h3>${m[0]}</h3><p>${m[2]}</p><span class="meal-tags">${m[3]}</span></article>`).join("");
}
function renderLibrary(){
 const q=($("exerciseSearch").value||"").toLowerCase();
 $("libraryGrid").innerHTML=exercises.filter(e=>e.join(" ").toLowerCase().includes(q)).map(e=>`<article class="library-item"><div class="icon">${e[1]}</div><b>${e[0]}</b><small>${e[2]}</small><span>${e[3]}</span></article>`).join("");
}
function updateProgressStats(){ $("water").textContent=state.water;$("water2").textContent=state.water;$("streak").textContent=state.streak;$("snapWater").textContent=state.water+" / 8";$("snapStreak").textContent=state.streak+" days";$("snapWorkouts").textContent=state.workouts }
function updateAll(){calcBMI();calcCalories();goalInfo();renderHabits();renderWorkout();renderMeals();renderLibrary();updateProgressStats();$("snapHeight").textContent=state.height+" cm";$("snapWeight").textContent=state.weight+" kg"}
function addChat(text,type){
 const box=$("messages"), cls=type==="user"?"msg user":"msg bot", icon=type==="user"?"👤":"✦", name=type==="user"?"You":"FitAI Coach";
 box.insertAdjacentHTML("beforeend",`<div class="${cls}"><span>${icon}</span><div><b>${name}</b><p>${escapeHTML(text)}</p></div></div>`);
 box.scrollTop=box.scrollHeight;
}
function escapeHTML(s){return s.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function askQuick(q){go("coach");setTimeout(()=>{ $("chatInput").value=q;sendChat()},80)}
function sendChat(){
 const input=$("chatInput"),q=input.value.trim();if(!q)return;
 addChat(q,"user");input.value="";
 setTimeout(()=>addChat(coachAnswer(q),"bot"),250);
}
function coachAnswer(q){
 const t=q.toLowerCase();
 if(t.includes("today")||t.includes("plan"))return `Based on your ${goalName()} goal, start with today's workout, complete the habit checklist, drink water regularly and use the meal structure in Nutrition. I can also explain any exercise in your plan.`;
 if(t.includes("workout")||t.includes("exercise")||t.includes("training"))return `Your plan uses simple movements: squats, push-ups, rows, core work and easy cardio. Start with a warm-up, use controlled form and increase difficulty gradually. Stop if you feel pain.`;
 if(t.includes("protein")||t.includes("muscle"))return `Protein supports muscle repair. Your dashboard estimates about ${$("proteinTarget").textContent}. Spread protein across balanced meals from foods such as eggs, dairy, beans, lentils, fish or meat.`;
 if(t.includes("eat")||t.includes("diet")||t.includes("meal")||t.includes("food"))return `Use the Nutrition tab for a simple four-meal structure: protein + a carbohydrate source + fruit/vegetables. You don't need a complicated diet to build good habits.`;
 if(t.includes("water")||t.includes("hydration"))return `You have logged ${state.water}/8 glasses today. Sip regularly and drink more around exercise or hot weather. Your water target here is a simple habit tracker, not a medical prescription.`;
 if(t.includes("sleep")||t.includes("recover")||t.includes("rest"))return `Recovery matters. Keep a consistent sleep routine, give hard-working muscles rest and avoid trying to train intensely every day.`;
 if(t.includes("bmi"))return `Your estimated BMI is ${$("bmi").textContent}. BMI is only a screening measure and doesn't describe body composition or overall health by itself.`;
 if(t.includes("warm"))return `Try 5–10 minutes of easy movement followed by dynamic movements related to your session. The goal is to gradually raise body temperature and prepare for training.`;
 if(t.includes("lose")||t.includes("fat"))return `For healthy weight management, focus on regular movement, balanced meals, enough sleep and sustainable habits. Avoid crash diets or extreme restriction.`;
 if(t.includes("beginner"))return `Start with 2–3 manageable full-body sessions per week, easy cardio or walking on other days, and recovery between harder sessions.`;
 if(t.includes("hello")||t.includes("hi")||t.includes("hey"))return `Hey ${state.name}! ✦ I'm ready. Ask me about today's workout, meals, protein, water, sleep, recovery or any exercise.`;
 return `I can help with workouts, exercise technique, meal structure, protein, hydration, sleep, recovery, BMI and your FitAI plan. Try asking a specific fitness question.`;
}
function goalName(){return {muscle:"muscle building",fatloss:"healthy weight management",fitness:"overall fitness",maintain:"maintenance"}[state.goal]}
function logout(){if(confirm("Reset your FitAI profile?")){localStorage.removeItem(KEY);location.reload()}}
loadApp();
