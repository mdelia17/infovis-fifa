var dataset;
var teams; 
var x;
var y;
var color;
var x0,x1,y0;

var current_team;

var groups;
var subgroups;
var legends;

var columnHeaders;
var innerColumns;

var highlightedPlayer = null;

subgroups = ["punti_portiere","punti_attacco","punti_difesa","punti_tecnica","punti_velocita","punti_mentalita","punti_potenza"]
legends = ["Portiere","Attacco","Difesa","Tecnica","Velocità","Mentalità","Potenza"]
    
columnHeaders = ["punti_portiere","punti_attacco","punti_difesa","punti_tecnica","punti_velocita","punti_mentalita","punti_potenza", "punti_portiere_pos", "punti_portiere_neg", "punti_attacco_pos", "punti_attacco_neg", "punti_difesa_pos", "punti_difesa_neg", "punti_tecnica_pos", "punti_tecnica_neg", "punti_velocita_pos", "punti_velocita_neg", "punti_mentalita_pos", "punti_mentalita_neg", "punti_potenza_pos", "punti_potenza_neg"]
innerColumns = {
      "Portiere" : ["punti_portiere","punti_portiere_pos", "punti_portiere_neg"],
      "Attacco" : ["punti_attacco","punti_attacco_pos", "punti_attacco_neg"],
      "Difesa" : ["punti_difesa","punti_difesa_pos", "punti_difesa_neg"],
      "Tecnica" : ["punti_tecnica","punti_tecnica_pos", "punti_tecnica_neg"],
      "Velocità" : ["punti_velocita","punti_velocita_pos", "punti_velocita_neg"],
      "Mentalità" : ["punti_mentalita","punti_mentalita_pos", "punti_mentalita_neg"],
      "Potenza" : ["punti_potenza","punti_potenza_pos", "punti_potenza_neg"]
}


// set the dimensions and margins of the graph
const margin = {top: 30, right: 30, bottom: 90, left: 60},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// set the dimensions and margins of the graph
const margin_2 = {top: 30, right: 30, bottom: 90, left: 60},
    width_2 = 1800 - margin_2.left - margin_2.right,
    height_2 = 400 - margin_2.top - margin_2.bottom;

// append the svg object to the body of the page
const svg_1 = d3.select("#player_div")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// append the svg object to the body of the page
const svg_2 = d3.select("#team_div")
  .append("svg")
    .attr("width", width_2 + margin_2.left + margin_2.right)
    .attr("height", height_2 + margin_2.top + margin_2.bottom)
  .append("g")
    .attr("transform",`translate(${margin_2.left},${margin_2.top})`);

d3.json("data/players.json")
	.then(function(data) {
        dataset = data;
        d3.json("data/teams.json")
      	  .then(function(data) {
              teams = data;
              main(data);
  })});

function main(data) {
    // console.log(dataset)
    updateTeams()
    updateOpponentTeams()
    players = searchPlayers(dataset)
    drawXAxis(players)
    drawYAxis(players)

    current_team = document.getElementById("squadra").value
    team_2 = document.getElementById("squadra_avversaria").value
    teams_to_compare = getFilteredTeamsToCompare(current_team, team_2)
    groups = teams_to_compare.map(d => d.club_name)
    
    colorAxis(teams_to_compare)

    drawBarChartPlayers(players)
    document.getElementById("player_button").onclick = function() {updateSearch()}
    document.getElementById("campionato").onchange = function() {updateTeams()}
    document.getElementById("team_button").onclick = function() {compareTeams()}

    drawXAxisTeam(teams_to_compare)
    drawXSubgroupAxisTeam(teams_to_compare)
    drawYAxisTeam(teams_to_compare)

    drawStackedGroupedBarChartTeams(teams_to_compare)
}

function drawBarChartPlayers(data) {
  // Bars
  svg_1.selectAll(".bar")
  .data(data)
  .enter()
  .append("rect")
    .attr("x", d => x(d.short_name))
    .attr("y", d => y(d[document.getElementById("caratteristiche").value]))
    .attr("width", x.bandwidth())
    .attr("height", d => height - y(d[document.getElementById("caratteristiche").value]))
    .attr("fill", color(document.getElementById("caratteristiche").value))
    .attr("class", "bar")
    .attr('stroke-width', 0)
    .attr("stroke", "#404040")
    .on("mouseover", function(event, d) {
      d3.select("#player_div")
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
          .html(drawTooltip(d))
          .style("opacity", 1)
          
    })
    .on("mousemove", function(event, d) {
      d3.select(".tooltip").style("transform","translateY(-55%)")  
              .style("left",(event.x)/2+"px")
              .style("top",(event.y)/2-30+"px")
    })
    .on("mouseleave", function(event, d) {
      d3.select(".tooltip").remove()
    })
    .on('click', function(event, d) {
      if (highlightedPlayer == d) {
        d3.selectAll(".bar").attr("opacity",1).attr('stroke-width', 0)
        highlightedPlayer = null;
        resetSelectedBar()
        compareTeams()
      }
      else {
      d3.selectAll(".bar").attr("opacity",0.4).attr('stroke-width', 0)
      d3.select(this).attr("opacity",1).attr('stroke-width', 1.2)
      d3.select(".detail").html(drawDetail(d))
      highlightedPlayer = (d)
      compareTeams()
      }
    })

    // Labels
    svg_1.selectAll(".text")        
      .data(data)
      .enter()
      .append("text")
        .attr("class","label")
        .attr("x", (function(d) { return x(d.short_name) + x.bandwidth()/100; }  ))
        .attr("y", function(d) { return y(d[document.getElementById("caratteristiche").value]) - 20; })
        .attr("font-size","12px")
        .attr("font-family","Verdana")
        .attr("dy", "1em")
        .text(function(d) { return d[document.getElementById("caratteristiche").value].toFixed(1); });

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
  svg_1.select(".x_axis")
      .call(d3.axisBottom(x))
      .selectAll("text")
          .attr("transform", "translate(-10,0)rotate(-45)")
          .style("text-anchor", "end")
          .attr("font-family","Verdana")

  d3.select(".detail").html("Scheda Giocatore")

  // Create the u variable
  var u = svg_1.selectAll(".bar")
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
      .attr("fill", color(document.getElementById("caratteristiche").value))
      .attr("class", "bar")  

  // If less group in the new dataset, I delete the ones not in use anymore
  u.exit()
    .remove()

  var v = svg_1.selectAll(".label")
    .data(data)

  v.enter()
  .append("text")
  .merge(v)
  .transition() // and apply changes to all of them
  .duration(3000)
    .attr("class","label")
    .attr("x", (function(d) { return x(d.short_name) + x.bandwidth()/100; }  ))
    .attr("y", function(d) { return y(d[document.getElementById("caratteristiche").value]) - 20; })
    .attr("font-size","12px")
    .attr("font-family","Verdana")
    .attr("dy", "1em")
    .text(function(d) { return d[document.getElementById("caratteristiche").value].toFixed(1); }); 

    v.exit()
    .remove()
}

function drawXAxis(data) {
  x = d3.scaleBand()
  .range([ 0, width ])
  .domain(data.map(d => d.short_name))
  .padding(0.2);
svg_1.append("g")
  .attr("transform", `translate(0, ${height})`)
  .call(d3.axisBottom(x))
  .attr("class", "x_axis")
  .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end")
    .attr("font-family", "Verdana")
}

function drawYAxis(data) {
  y =  d3.scaleLinear()
  .domain([0, 99])
  .range([ height, 0]);
svg_1.append("g")
  .call(d3.axisLeft(y))
  .attr("class", "y_axis")
  .attr("font-family","Verdana")
}

function drawColorAxis(data) {
  color = d3.scaleOrdinal()
    .domain(subgroups)
    // .range(["#4e79a7","#59a14f","#9c755f","#f28e2b","#edc948","#bab0ac","#e15759"])
    .range(["#4e79a7","#76b7b2","#edc949","#af7aa1","#ff9da7","#9c755f","#bab0ab"])
}

function drawXAxisTeam(data) {
  x0 = d3.scaleBand()
  .range([ 0, width_2 - 300])
  .padding(0.2);

  x0.domain(teams_to_compare.map(function(d) { return d.club_name; }));
  
  svg_2.append("g")
    .attr("class", "x0")
    .attr("transform", `translate(0, ${height_2})`)
    .call(d3.axisBottom(x0));
    
  svg_2.select(".x0")
    .call(d3.axisBottom(x0))
    .selectAll("text")
    .attr("transform", "translate(0,5)")
    .attr("font-family", "Verdana")
}

function drawXSubgroupAxisTeam(data) {
  x1 = d3.scaleBand()
  .range([0, x0.bandwidth()])
  .padding([0.05]);

  x1.domain(legends);
}

function drawYAxisTeam(data) {
  y0 = d3.scaleLinear()
  .domain([0, 99])
  .range([height_2, 0]);    

  svg_2.append("g")
  .attr("class", "y0")
  .call(d3.axisLeft(y0))
.attr("font-family","Verdana")
}

function colorAxis(data) {
  color = d3.scaleOrdinal()
    .domain(columnHeaders)
    .range(["#4e79a7","#76b7b2","#edc949","#af7aa1","#ff9da7","#9c755f","#bab0ab","#59a14f","#e15759","#59a14f","#e15759","#59a14f","#e15759","#59a14f","#e15759","#59a14f","#e15759","#59a14f","#e15759","#59a14f","#e15759"])
}

function drawStackedGroupedBarChartTeams(data) {

  x0.domain(data.map(function(d) { return d.club_name; }));
  svg_2.select(".x0")
       .call(d3.axisBottom(x0))
       .selectAll("text")
        .attr("transform", "translate(0,5)")
        .attr("font-family", "Verdana")

  svg_2.append("g")
  .selectAll("g")
      .data(data)
    .join("g")
      .attr("class", "team_stackedBars")
      .attr("transform", d => `translate(${x0(d.club_name)}, 0)`)
    .selectAll("rect")
      .data(function(d) { return d.columnDetails; })
    .join("rect")
      .attr("width", x1.bandwidth())
      .attr("x", function(d) { 
        return x1(d.column);
         })
      .attr("y", function(d) { 
        return y0(d.yEnd); 
      })
      .attr("height", function(d) { 
        return y0(d.yBegin) - y0(d.yEnd); 
      })
      // .attr("class", function(d) {return d.name})
      .attr("class", "team_stackedBar")
      .style("fill", function(d) { return color(d.name); });

  svg_2.append("g")
      .selectAll("g")
      // Enter in data = loop group per group
      .data(data)
      .join("g")
        .attr("class", "team_stackedLabels")
        .attr("transform", d => `translate(${x0(d.club_name)}, 0)`)
      .selectAll("text")
      .data(function(d) { return legends.map(function(key) {
        let y = 0;
        value = 0;
        for (i in innerColumns[key]) {
          prop = innerColumns[key][i];
          if (prop.indexOf("_neg") >= 0) {
            y = y + d[prop];
            value = value - d[prop];
          }
          else {
            y = y + d[prop];
            value = value + d[prop];
          }
        }
        y = y.toFixed(1)
        value = value.toFixed(1)
          return {key: key, value: value, y: y}; }); })
      .join("text")
      .attr("x", function(d) { return x1(d.key);})
        .attr("y", d => y0(d.y) -20)
        .attr("class","team_stackedLabel")
        .text(function(d) { return (d.value); })
        .attr("font-size","12px")
        .attr("font-family","Verdana")
        .attr("dy", "1em")
 
        var legspacing = 18;
        var legend = svg_2.selectAll(".legend")
          .data(subgroups)
            .enter()
            .append("g")
  
        legend.append("rect")
          .attr("fill", color)
          .attr("width", 15)
          .attr("height", 15)
          .attr("y", function (d, i) {
              return i * legspacing - 30;
          })
          .attr("x", 600);
  
        legend.append("text")
            .attr("class", "label")
            .attr("y", function (d, i) {
                return i * legspacing - 19;
            })
            .attr("x", 620)
            .attr("text-anchor", "start")
            .attr("font-family", "Verdana")
            .attr("font-size", "12px")
            .text(function (d, i) {
                return legends[i];
            });
}

function updateStackedGroupedBarChartTeams(data) {
  x0.domain(data.map(function(d) { return d.club_name; }));
  svg_2.select(".x0")
       .call(d3.axisBottom(x0))
       .selectAll("text")
        .attr("transform", "translate(0,5)")
        .attr("font-family", "Verdana")

  var u = svg_2.selectAll(".team_stackedBars")
  .data(data)

  u.enter()
  .append("g")
  .merge(u)
    .attr("class", "team_stackedBars")
    .attr("transform", d => `translate(${x0(d.club_name)}, 0)`)
  .selectAll("rect")
  .data(function(d) { return d.columnDetails; })
  .merge(d3.selectAll(".team_stackedBar"))
    .transition() // and apply changes to all of them
    .duration(3000)
      .attr("width", x1.bandwidth())
      .attr("x", function(d) { 
        return x1(d.column);
         })
      .attr("y", function(d) { 
        return y0(d.yEnd); 
      })
      .attr("height", function(d) { 
        return y0(d.yBegin) - y0(d.yEnd); 
      })
      // .attr("class", function(d) {return d.name})
      .attr("class", "team_stackedBar")
      .style("fill", function(d) { return color(d.name); });

      var v = svg_2.selectAll(".team_stackedLabels")
      .data(data)

      v.enter()
      .append("g")
      .merge(v)
        .attr("class", "team_stackedLabels")
        .attr("transform", d => `translate(${x0(d.club_name)}, 0)`)
      .selectAll("text")
      .data(function(d) { return legends.map(function(key) {
        let y = 0;
        value = 0;
        for (i in innerColumns[key]) {
          prop = innerColumns[key][i];
          if (prop.indexOf("_neg") >= 0) {
            y = y + d[prop];
            value = value - d[prop];
          }
          else {
            y = y + d[prop];
            value = value + d[prop];
          }
        }
        y = y.toFixed(1)
        value = value.toFixed(1)
          return {key: key, value: value, y: y}; }); })
      .merge(d3.selectAll(".team_stackedLabel"))
      .transition() // and apply changes to all of them
      .duration(3000)
        .attr("x", function(d) { return x1(d.key);})
        .attr("y", d => y0(d.y) -20)
        .attr("class","team_stackedLabel")
        .text(function(d) { return (d.value); })
        .attr("font-size","12px")
        .attr("font-family","Verdana")
        .attr("dy", "1em")

  u.exit().remove()
  v.exit().remove()
}

function getFilteredTeamsToCompare(team_1, team_2) {
  filtered = teams.filter(function(team) { return team.club_name == team_1 || team.club_name == team_2; });
  var team_a = Object.create(filtered[0])
  var team_b = Object.create(filtered[1])
  sorted = []
  if (team_a.club_name == team_1) {
    sorted = [team_a, team_b]
  }
  else {
    sorted = [team_b, team_a]
  }
  for (var i = 0; i < subgroups.length; i++) { 
    if (highlightedPlayer != null) {
      let tot = ((sorted[0][subgroups[i]] * sorted[0].count) + highlightedPlayer[subgroups[i]]) / (sorted[0].count + 1)
      tot = tot.toFixed(1)
      let delta = tot - sorted[0][subgroups[i]]
      if (delta >= 0) {
        sorted[0][subgroups[i]+"_pos"] = delta
        sorted[0][subgroups[i]+"_neg"] = 0
      }
      else {
        sorted[0][subgroups[i]] = sorted[0][subgroups[i]] + delta
        sorted[0][subgroups[i]+"_neg"] = (-delta)
        sorted[0][subgroups[i]+"_pos"] = 0  
      }
    }
    else {
      sorted[0][subgroups[i]+"_pos"] = 0
      sorted[0][subgroups[i]+"_neg"] = 0
    }
    sorted[1][subgroups[i]+"_pos"] = 0
    sorted[1][subgroups[i]+"_neg"] = 0
  }
  sorted.forEach(function(d) {
    var yColumn = new Array();
    d.columnDetails = columnHeaders.map(function(name) {
      for (ic in innerColumns) {
        //if($.inArray(name, innerColumns[ic]) >= 0){
        if(innerColumns[ic].indexOf(name) >= 0){
          if (!yColumn[ic]){
            yColumn[ic] = 0;
          }
          yBegin = yColumn[ic];
          yColumn[ic] += +d[name];
          return {name: name, column: ic, yBegin: yBegin, yEnd: +d[name] + yBegin,};
        }
      }
    });
    d.total = d3.max(d.columnDetails, function(d) { 
      return d.yEnd; 
    });
  });
  // console.log(sorted)
  return sorted
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
    data = getFilteredPlayers(dataset, squadra, ruolo, caratteristiche, budget, 10)
    // console.log(data)
    return data
}

function updateSearch() {
    resetSelectedBar()
    updateOpponentTeams()
    squadra = document.getElementById("squadra").value;
    current_team = squadra;
    ruolo = document.getElementById("ruolo").value;
    caratteristiche = document.getElementById("caratteristiche").value;
    budget = document.getElementById("budget").value;
    data = getFilteredPlayers(dataset, squadra, ruolo, caratteristiche, budget, 10)
    highlightedPlayer = null
    updateBarChartPlayers(data)
    compareTeams()
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
  opponent_team_name = document.getElementById('squadra_avversaria').value
  teams_to_compare = getFilteredTeamsToCompare(current_team, opponent_team_name)
  updateStackedGroupedBarChartTeams(teams_to_compare)
}