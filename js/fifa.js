var dataset; // global
var x;
var y;

// set the dimensions and margins of the graph
const margin = {top: 30, right: 30, bottom: 70, left: 60},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("body")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

d3.json("data/players.json")
	.then(function(data) {
        dataset = data;
        main(data);
    });

function main(data) {
    console.log(data)
    players = searchPlayers(data)
    drawXAxis(players)
    drawYAxis(players)
    drawBarChartPlayers(players)
    document.getElementById("player_button").onclick = function() {updateSearch()};
}

// funzione per prendere i giocatori a seconda dei filtri impostati
function getFilteredPlayers(data, campionato, ruolo, caratteristiche, budget, k) {
    filtered = data.filter(function(player) { return player.player_positions.includes(ruolo) && player.league_name == campionato && player.value_eur <= budget; });
    sorted = filtered.sort(function(b, a) {return d3.descending(b[caratteristiche], a[caratteristiche]);});
    top_k = sorted.slice(0, k);
    return top_k
}

function drawBarChartPlayers(data) {
    // sort data
    // data.sort(function(b, a) {
    //   return a.punti_attacco - b.punti_attacco;
    // });
    // X axis
    
  
    // Bars
    svg.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .transition() // and apply changes to all of them
      .duration(3000)
        .attr("x", d => x(d.short_name))
        .attr("y", d => y(d[document.getElementById("caratteristiche").value]))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d[document.getElementById("caratteristiche").value]))
        .attr("fill", "#69b3a2")
        .attr("class", "bar")
  }


  function updateBarChartPlayers(data) {
    // Update the X axis
    x.domain(data.map(function(d) { return d.short_name; }))
    svg.select(".x_axis")
        .call(d3.axisBottom(x))
        .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");
  
    // // Update the Y axis
    // y.domain([0, d3.max(data, function(d) { return d.punti_attacco }) ]);
    // yAxis.transition().duration(1000).call(d3.axisLeft(y));

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
      .style("text-anchor", "end");
  }

  function drawYAxis(data) {
   y=  d3.scaleLinear()
    .domain([0, 99])
    .range([ height, 0]);
  svg.append("g")
    .call(d3.axisLeft(y))
    .attr("class", "y_axis");
  }

//   function startListeners() {
//     $groupSelector.onchange = function(e) {
//         var group = e.target.value;
//         console.log(group)
//         var data2 = getFilteredPlayers(dataset, group, 5);
//         updateBarChartPlayers(data2)
//     }
//   }

function searchPlayers() {
    campionato = document.getElementById("campionato").value;
    ruolo = document.getElementById("ruolo").value;
    caratteristiche = document.getElementById("caratteristiche").value;
    budget = document.getElementById("budget").value;
    data = getFilteredPlayers(dataset, campionato, ruolo, caratteristiche, budget, 5)
    console.log(data)
    return data
}

function updateSearch() {
    campionato = document.getElementById("campionato").value;
    ruolo = document.getElementById("ruolo").value;
    caratteristiche = document.getElementById("caratteristiche").value;
    budget = document.getElementById("budget").value;
    data = getFilteredPlayers(dataset, campionato, ruolo, caratteristiche, budget, 5)
    console.log(data)
    updateBarChartPlayers(data)
}