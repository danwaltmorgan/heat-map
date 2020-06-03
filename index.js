
const title = d3.select("body")
.append("h1")
.text("Global Surface Temperature")
.attr("id", "title")

const description = d3.select("body")
  .append("h2")
  .text("Base Temperature: 8.66 °C")
  .attr("id", "description")




fetch("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json")
  .then(response => response.json())
  .then(data => {
    // console.log(JSON.stringify(data))

    const dataset = data.monthlyVariance
    const h = 12 * 50
    const w = dataset.length / 2.5
    const padding = 70

    const svg = d3.select("body")
    .append("svg")
    .attr("height", h)
    .attr("width", w)

    dataset.forEach(d => {
      d.month = d.month - 1
    })

    const xScale = d3.scaleBand()
      .domain(dataset.map(y => y.year))
      .range([padding, w - padding])

    const yScale = d3.scaleBand()
      .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
      .range([padding, h - padding])

    const color = ['#a50026','#d73027','#f46d43','#fdae61','#fee090','#ffffbf','#e0f3f8','#abd9e9','#74add1','#4575b4','#313695'].reverse()

    // const color = ['#9e0142','#d53e4f','#f46d43','#fdae61','#fee08b','#ffffbf','#e6f598','#abdda4','#66c2a5','#3288bd','#5e4fa2'].reverse()

    const xAxis = d3.axisBottom(xScale)
      .tickFormat(year => {
        let date = new Date(year, 0, 1)
        let formatYear = d3.timeFormat("%Y")
        return formatYear(date)
      })
      .tickValues(xScale.domain().filter(year => {
        return year % 10 === 0
      }))

    const yAxis = d3.axisLeft(yScale)
      .tickFormat(month => {
        let date = new Date(1970, month, 1)
        let formatMonth = d3.timeFormat("%B")
        return formatMonth(date)
      })


    const min = d3.min(dataset, d => d.variance) + data.baseTemperature
    const max = d3.max(dataset, d => d.variance) + data.baseTemperature

    const thresholdDomain = () => {
      let array = []
      let count = color.length
      let step = (max - min) / count
      for (let i = 1; i < count; i++) {
        array.push(min + (i * step))
      }
      return array
    }

    const threshold = d3.scaleThreshold()
      .domain(thresholdDomain())
      .range(color)

    const tooltip = d3.select("body")
      .append("div")
      .attr("id", "tooltip")
      .style("display", "none")

    svg.selectAll("rect")
      .data(dataset)
      .enter()
      .append("rect")
      .attr("height", 40)
      .attr("width", 5)
      .attr("x", d => xScale(d.year))
      .attr("y", d => yScale(d.month))
      .style("fill", d => {
        return threshold(d.variance + data.baseTemperature)
      })
      .attr("class", "cell")
      .attr("data-month", (d) => d.month)
      .attr("data-year", (d) => d.year)
      .attr("data-temp", (d) => d.variance + data.baseTemperature)
      .on("mouseover", d => {
        tooltip.style("display", "block")
          .style("left", (d3.event.pageX - 70) + "px")
          .style("top", d3.event.pageY - h - 220 + "px")
          .html(
            `${d.year} <br>
            ${(d.variance + data.baseTemperature).toFixed(3)} °C <br>
            ${d.variance} °C`)
          .attr("data-year", d.year)
      })
      .on("mouseout", d => {
        tooltip.style("display", "none")
      })

    svg.append("g")
      .attr("transform", `translate(0, ${h - padding})`)
      .call(xAxis)
      .attr("id", "x-axis")
    svg.append("g")
      .attr("transform", `translate(${padding}, 0)`)
      .call(yAxis)
      .attr("id", "y-axis")

    const legendX = d3.scaleLinear()
      .domain([min, max])
      .range([0, 400])

    const legendAxis = d3.axisBottom(legendX)
      .tickValues(threshold.domain())
      .tickFormat(d3.format(".1f"))
      .tickSize([400/11])


    const legend = svg.append("g")
      .attr("id", "legend")
      .attr("width", 400)
      .attr("height", 50)
      .style("transform", `translate(${420}px, 0)`)


    legend
      .selectAll("rect")
      .data(color)
      .enter()
      .append("rect")
      .attr("width", 400 / 11)
      .attr("height", 400 / 11)
      .attr("x", (d, i) => i * (400 / 11))
      .style("fill", d => d)

    legend.append("g").call(legendAxis)

  })
