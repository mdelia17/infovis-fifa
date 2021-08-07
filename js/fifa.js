var dataset; // global
var teams; 
var x;
var y;

// set the dimensions and margins of the graph
const margin = {top: 30, right: 30, bottom: 90, left: 60},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#player_div")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

d3.json("data/players.json")
	.then(function(data) {
        dataset = data;
        d3.json("data/teams.json")
      	  .then(function(data) {
              teams = data;
              main(data);
  })});

function main(data) {
    console.log(dataset)
    updateTeams()
    updateOpponentTeams()
    players = searchPlayers(dataset)
    drawXAxis(players)
    drawYAxis(players)
    drawBarChartPlayers(players)
    document.getElementById("player_button").onclick = function() {updateSearch()}
    document.getElementById("campionato").onchange = function() {updateTeams()}
    document.getElementById("team_button").onclick = function() {compareTeams()}

}

function drawBarChartPlayers(data) {
    // Tooltip    
    var tooltip = d3.select("#player_div")
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "1px")
      .style("border-radius", "5px")
      .style("padding", "5px")
      .style("position", "absolute")
      .style("font-size","12px")
      .style("font-family","Verdana")

    // Bars
    svg.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
        .attr("x", d => x(d.short_name))
        .attr("y", d => y(d[document.getElementById("caratteristiche").value]))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d[document.getElementById("caratteristiche").value]))
        .attr("fill", "#69b3a2")
        .attr("class", "bar")
        .attr('stroke-width', 0)
        .attr("stroke", "#404040")
        .on("mouseover", function(event, d) {
          tooltip
              .html(drawTooltip(d))
              .style("opacity", 1)
              
        })
        .on("mousemove", function(event, d) {
          tooltip.style("transform","translateY(-55%)")  
                 .style("left",(event.x)/2+"px")
                 .style("top",(event.y)/2-30+"px")
        })
        .on("mouseleave", function(event, d) {
          tooltip
            .style("opacity", 0)
        })
        .on('click', function(event, d) {
          d3.selectAll(".bar").attr("opacity",0.4).attr('stroke-width', 0)
          d3.select(this).attr("opacity",1).attr('stroke-width', 1.2)
          d3.select(".detail").html(drawDetail(d))
        })

    // Labels
    svg.selectAll(".text")        
      .data(data)
      .enter()
      .append("text")
        .attr("class","label")
        .attr("x", (function(d) { return x(d.short_name) + x.bandwidth()/4; }  ))
        .attr("y", function(d) { return y(d[document.getElementById("caratteristiche").value]) - 20; })
        .attr("font-size","12px")
        .attr("font-family","Verdana")
        .attr("dy", "1em")
        .text(function(d) { return d[document.getElementById("caratteristiche").value]; });

  var detail = d3.select("#player_div")
      .append("div")
      .style("opacity", 1)
      .attr("class", "detail")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "1px")
      .style("border-radius", "5px")
      .style("padding", "5px")
      .style("position", "relative")
      .style("top", "-350px")
      .style("left" , "500px")
      .style("width", "250px")
      .style("height", "200px")
      .style("font-size","12px")
      .style("font-family","Verdana")
      .html("Scheda Giocatore")
      // .html(drawDetail(data[0]))
  }


function updateBarChartPlayers(data) {
  // Update the X axis
  x.domain(data.map(function(d) { return d.short_name; }))
  svg.select(".x_axis")
      .call(d3.axisBottom(x))
      .selectAll("text")
          .attr("transform", "translate(-10,0)rotate(-45)")
          .style("text-anchor", "end")
          .attr("font-family","Verdana")

  d3.select(".detail").html("Scheda Giocatore")

  // Create the u variable
  var u = svg.selectAll(".bar")
    .data(data)

  u.enter()
    .append("rect") // Add a new rect for each new elements
    .merge(u) // get the already existing elements as well
    .transition() // and apply changes to all of them
    .duration(3000)
      .attr("x", function(d) { return x(d.short_name); })
      .attr("y", function(d) { return y(d[document.getElementById("caratteristiche").value]); })
      .attr("width", x.bandwidth())
      .attr("height", function(d) { return height - y(d[document.getElementById("caratteristiche").value]); })
      .attr("fill", "#69b3a2")
      .attr("class", "bar")  

  // If less group in the new dataset, I delete the ones not in use anymore
  u.exit()
    .remove()

  var v = svg.selectAll(".label")
    .data(data)

  v.enter()
  .append("text")
  .merge(v)
  .transition() // and apply changes to all of them
  .duration(3000)
    .attr("class","label")
    .attr("x", (function(d) { return x(d.short_name) + x.bandwidth()/4; }  ))
    .attr("y", function(d) { return y(d[document.getElementById("caratteristiche").value]) - 20; })
    .attr("font-size","12px")
    .attr("font-family","Verdana")
    .attr("dy", "1em")
    .text(function(d) { return d[document.getElementById("caratteristiche").value]; }); 

    v.exit()
    .remove()
}

function drawXAxis(data) {
  x = d3.scaleBand()
  .range([ 0, width ])
  .domain(data.map(d => d.short_name))
  .padding(0.2);
svg.append("g")
  .attr("transform", `translate(0, ${height})`)
  .call(d3.axisBottom(x))
  .attr("class", "x_axis")
  .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end")
    .attr("font-family", "Verdana")
}

function drawYAxis(data) {
  y=  d3.scaleLinear()
  .domain([0, 99])
  .range([ height, 0]);
svg.append("g")
  .call(d3.axisLeft(y))
  .attr("class", "y_axis")
  .attr("font-family","Verdana")
}

// funzione per prendere i giocatori a seconda dei filtri impostati
function getFilteredPlayers(data, squadra, ruolo, caratteristiche, budget, k) {
  filtered = data.filter(function(player) { return player.player_positions.includes(ruolo) && player.club_name != squadra &&  player.value_eur <= budget; });
  sorted = filtered.sort(function(b, a) {return d3.descending(b[caratteristiche], a[caratteristiche]);});
  top_k = sorted.slice(0, k);
  if (top_k.length < k) {
    l = top_k.length
    b_filtered = data.filter(function(player) { return player.player_positions.includes(ruolo) && player.club_name != squadra &&  player.value_eur > budget; });
    b_sorted = b_filtered.sort(function(b, a) {return d3.ascending(b.value_eur, a.value_eur);});
    top_l = b_sorted.slice(0, k-l);
    concated = top_k.concat(top_l);
    concated = concated.sort(function(b, a) {return d3.descending(b[caratteristiche], a[caratteristiche]);});
    return concated;
  }
  return top_k
}

// funzione per prendere le squadre a seconda del campionato selezionato
function getFilteredTeams(data, campionato) {
  filtered = data.filter(function(team) { return team.league_name == campionato; });
  return filtered
}

// funzione per prendere tutte le squadre avversarie della squadra scelta nello stesso campionato
function getOpponentTeams(data, campionato, squadra) {
  filtered = data.filter(function(team) { return team.league_name == campionato && team.club_name != squadra});
  return filtered
}

function searchPlayers() {
    squadra = document.getElementById("squadra").value;
    ruolo = document.getElementById("ruolo").value;
    caratteristiche = document.getElementById("caratteristiche").value;
    budget = document.getElementById("budget").value;
    data = getFilteredPlayers(dataset, squadra, ruolo, caratteristiche, budget, 5)
    // console.log(data)
    return data
}

function updateSearch() {
    resetSelectedBar()
    updateOpponentTeams()
    squadra = document.getElementById("squadra").value;
    ruolo = document.getElementById("ruolo").value;
    caratteristiche = document.getElementById("caratteristiche").value;
    budget = document.getElementById("budget").value;
    data = getFilteredPlayers(dataset, squadra, ruolo, caratteristiche, budget, 5)
    // console.log(data)
    updateBarChartPlayers(data)
}

function updateTeams() {
  campionato = document.getElementById("campionato").value;
  filtered_teams = getFilteredTeams(teams, campionato)
  // console.log(filtered_teams)
  while(document.getElementById('squadra').options.length)
    document.getElementById('squadra').options.remove(0);
  for (index = 0; index < filtered_teams.length; index++) {
    document.getElementById('squadra').options.add(new Option(filtered_teams[index].club_name,filtered_teams[index].club_name,false,false), index)}
}

function updateOpponentTeams() {
  campionato = document.getElementById("campionato").value;
  squadra = document.getElementById("squadra").value;
  filtered_opponent_teams = getOpponentTeams(teams, campionato, squadra)
  // console.log(filtered_opponent_teams)
  while(document.getElementById('squadra_avversaria').options.length)
    document.getElementById('squadra_avversaria').options.remove(0);
  for (index = 0; index < filtered_opponent_teams.length; index++) {
    document.getElementById('squadra_avversaria').options.add(new Option(filtered_opponent_teams[index].club_name,filtered_opponent_teams[index].club_name,false,false), index)}
}

function drawTooltip(player) {
  return ("Portiere: " + player.punti_portiere
  + "<br>" + "Difesa: " + player.punti_difesa + "<br>" + "Attacco: " + player.punti_attacco + "<br>" + "Tecnica: " + player.punti_tecnica + "<br>" + "Potenza: " + player.punti_potenza + "<br>" + "Velocità: " + player.punti_velocita + "<br>" + "Mentalità: " + player.punti_mentalita)
}

function drawDetail(player) {
  return ("Scheda Giocatore <br><br>" + "Nome: " + player.short_name + "<br>" + "Età: " + player.age + "<br>" + "Overall: " + player.overall + "<br>" + "Altezza: " + player.height_cm + "<br>" + "Peso: " + player.weight_kg + "<br>" + "Ruolo: " + player.player_positions + "<br>" + "Squadra: " + player.club_name + "<br>" + "Campionato: " + player.league_name + "<br>" + "Valore (€): " + player.value_eur + "<br>" + "Budget rimanente (€): " + (document.getElementById("budget").value - player.value_eur))
}

function resetSelectedBar() {
  d3.selectAll(".bar").attr("opacity",1).attr('stroke-width', 0)
  d3.select(".detail").html("Scheda Giocatore")
}

function compareTeams() {
  // to do
}