/*
 *    main.js
 *    Mastering Data Visualization with D3.js
 *    Project 2 - Gapminder Clone
 */

/* Make a static scatter plot for the first year in our data. 
	1)Set up some sensible dimensions for your visualization, and make it conform to the D3 margin convention. */

const MARGIN = { LEFT: 100, RIGHT: 10, TOP: 20, BOTTOM: 120 };

const WIDTH = 800 - MARGIN.LEFT - MARGIN.RIGHT;

const HEIGHT = 500 - MARGIN.TOP - MARGIN.BOTTOM;

const svg = d3
  .select("#chart-area")
  .append("svg")
  .attr("width", 800)
  .attr("height", 500);

const g = svg
  .append("g")
  .attr("transform", `translate (${MARGIN.LEFT}, ${MARGIN.TOP})`);

//Tooltips
const tips = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

//variables need to be further defined
let interval, formattedData;

/*2)Write scales for each axis (GDP-per-capita on the x-axis, life expectancy on the y-axis)
		i. Suggested domains: x – [100, 150000] ; y – [0, 90] .*/

//Y scales
const y = d3.scaleLinear().domain([0, 90]).range([HEIGHT, 0]);

/*ii. The x scale should be a logarithmic scale.*/

//X scales
const x = d3.scaleLog().domain([100, 150000]).range([0, WIDTH]).base(10);

//Circle areas
const area = d3
  .scaleLinear()
  .range([25 * Math.PI, 1500 * Math.PI])
  .domain([2000, 1400000000]);

//Continent Colors
const continentColor = d3.scaleOrdinal(d3.schemeSet3);

/*3)Append both axes with D3's axis generators.
		i.Use TickValues() to manually set our x-axis values of 400, 4,000, and 40,000.*/
const xAxisGroup = g
  .append("g")
  .attr("class", "x axis")
  .attr("transform", `translate(0, ${HEIGHT})`);

const yAxisGroup = g.append("g").attr("class", "y axis");

const xAxisCall = d3
  .axisBottom(x)
  .tickValues([400, 4000, 40000])
  .tickFormat(d3.format("$"));
xAxisGroup.call(xAxisCall);

const yAxisCall = d3.axisLeft(y);
yAxisGroup.call(yAxisCall);

//X label
g.append("text")
  .attr("class", "x-axis label")
  .attr("x", WIDTH / 2)
  .attr("y", HEIGHT + 70)
  .attr("text-anchor", "middle")
  .attr("font-size", "20px")
  .text("GDP per Capita ($)");

//Y label
g.append("text")
  .attr("class", "y-axis label")
  .attr("x", -(HEIGHT / 2))
  .attr("y", -60)
  .attr("text-anchor", "middle")
  .attr("font-size", "20px")
  .text("Life Expectancy (Years)")
  .attr("transform", "rotate(-90)");

//time variabel & time label
let time = 0;

const timeLabel = g
  .append("text")
  .attr("class", "time label")
  .attr("x", WIDTH - 20)
  .attr("y", HEIGHT - 10)
  .attr("text-anchor", "end")
  .attr("font-size", "40px")
  .text("1800");

//legend position
const legend = g
  .append("g")
  .attr("transform", `translate(${WIDTH - 10}, ${HEIGHT - 125})`);

//Take a look at the data that we're working with in your browser console. If there are any null values for one of the countries in one of the years, use a filter on the array to exclude that country-year data point from the dataset.

d3.json("./data/data.json").then(function (data) {
  //clean data;
  data.forEach(
    (year) =>
      (year["countries"] = year["countries"].filter(
        (country) => country.income !== null && country.life_exp !== null
      ))
  ); //BUG FIXME What it doesn't make sense to me is that how come I write the logic right but the program still cannot execute accordingly. SOLVED you just need to cover the year.countries variable with the filtered version
  //   console.log(data);

  //first year of our data
  //   const firstYear = data[0].countries;
  //   console.log(firstYear);

  //formatted data
  formattedData = data.map((year) => year["countries"]);
  console.log(formattedData);

  /*4)Append circles for each country in one year (e.g. the first year of our data)
   */
  // //Add a loop with d3.interval() , calling the update()  function on each iteration of the loop.
  // d3.interval(() => {
  //   time = time < formattedData.length ? time + 1 : 0;
  //   update(formattedData[time]);
  // }, 100);

  update(formattedData[0]);

  //Legend label
  const continents = [...new Set(formattedData[0].map((d) => d.continent))];
  // console.log(continents);

  continents.forEach((continent, i) => {
    const legendRows = legend
      .append("g") //FIXME You need to append groups instead of rectangles to show your legend rows. SOLVED
      .attr("transform", `translate(0, ${i * 20})`);

    legendRows
      .append("rect")
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", continentColor(continent));

    legendRows
      .append("text")
      .attr("x", -10)
      .attr("y", 10)
      .attr("text-anchor", "end")
      .style("text-transform", "capitalize")
      .text(continent);
  });
});

//Write an update()  function that makes use of the JOIN/EXIT/UPDATE/ENTER pattern discussed in this section.

//Store the loop in a different function
function step() {
  //at the end of our data, loop back
  time = time < formattedData.length ? time + 1 : 0;
  update(formattedData[time]);
}

//Play button (how it change according to the click)
$("#play-button").on("click", function () {
  const button = $(this);
  if (button.text() === "Play") {
    button.text("Pause");
    interval = setInterval(step, 100);
  } else {
    button.text("Play");
    clearInterval(interval);
  }
});

//Reset button.
$("#reset-button").on("click", () => {
  time = 0;
  update(formattedData[0]);
});

//Make sure selecting the continent would not affect the tip display
$("#continent-select").on("change", () => {
  update(formattedData[time]);
});

//Slider
$("#date-slider").slider({
  min: 1800,
  max: 2014,
  step: 1,
  slide: (event, ui) => {
    time = ui.value - 1800;
    update(formattedData[time]);
  },
});

function update(data) {
  //Put a transition on the update function of 100ms (it can’t be larger than the d3.interval time)
  const t = d3.transition().duration(100);

  const continent = $("#continent-select").val();

  const filteredData = data.filter((d) => {
    if (continent === "all") return true;
    else {
      return d.continent == continent;
    }
  });

  //The data JOIN needs to contain a key function linking it to individual countries, or else it won’t work
  const circles = g.selectAll("circle").data(filteredData, (d) => d.country);

  //EXIT
  circles.exit().remove();

  //ENTER && UPDATE new elements to the graph
  circles
    .enter()
    .append("circle")
    .attr("fill", (d) => continentColor(d.continent))
    .on("mouseover", function (event, d) {
      tips.transition().duration(200).style("opacity", 0.9);
      tips
        .html(
          `<strong>Country:</strong> <span style='color:red;text-transform:capitalize'>${
            d.country
          }</span><br>
        <strong>Continent:</strong> <span style='color:red;text-transform:capitalize'>${
          d.continent
        }</span><br>
        <strong>Life Expectancy:</strong> <span style='color:red'>${d3.format(
          ".2f"
        )(d.life_exp)}</span><br>
        <strong>GDP Per Capita:</strong> <span style='color:red'>${d3.format(
          "$,.0f"
        )(d.income)}</span><br>
        <strong>Population:</strong> <span style='color:red'>${d3.format(
          ",.0f"
        )(d.population)}</span><br>`
        )
        .style("left", event.pageX + "px")
        .style("top", event.pageY + "px");
    })
    .on("mouseout", (d) => {
      tips.transition().duration(500).style("opacity", 0);
    })
    .merge(circles)
    .transition(t)
    .attr("cx", (d) => x(d.income))
    .attr("cy", (d) => y(d.life_exp))
    .attr("r", (d) => Math.sqrt(area(d.population) / Math.PI));

  //UPDATE time label
  timeLabel.text(String(time + 1800));

  //make sure the year label is up to date
  $("#year")[0].innerHTML = String(time + 1800);

  $("#date-slider").slider("value", Number(time + 1800));
}

//Since I don't know why this is not working anymore

// d3.json("./data/data.json").then(function (data) {
//   //clean data
//   const dataFiltered = data.map((year) => {
//     return year["countries"]
//       .filter((country) => {
//         const dataExist = country.income && country.life_exp;
//         return dataExist;
//       })
//       .map((country) => {
//         country.income = Number(country.income);
//         country.life_exp = Number(country.life_exp);
//         return country;
//       });
//   });

//   console.log(dataFiltered);
// });

// d3.json("./data/test.json").then(function (data) {
//   //clean data
//   data.forEach((d) => {
//     d["content"] = d["content"].filter((i) => i.income !== null);
//   });

//   console.log(data);
// });
