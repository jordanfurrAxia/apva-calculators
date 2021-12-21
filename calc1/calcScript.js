let withdrawMap = new Map()
populateMap()

let tab1 = document.getElementById("tab1")
let tab2 = document.getElementById("tab2")
let rightBtn = document.getElementById("jrightBtn")
let leftBtn = document.getElementById("jleftBtn")
let showAllBtn = document.getElementById("jshowAllBtn")
let tabsSection = document.getElementsByClassName("jsectionTabs")[0]
    // let headers = document.getElementsByClassName("jheader")

addEventListeners()

showAllInputs()

function handleRightBtn(e) {
    if (rightBtn.innerHTML == "Next") {
        switchTab(e)
    } else {
        runCalculation()
    }
}

function showAllInputs() {
    let viewContainer = document.getElementsByClassName("jtabViewContainer")[0]
    if (showAllBtn.innerHTML == "Show All Input") {
        tab1view.style = "display: block;"
        tab2view.style = "display: block;"
            // for (let header of headers) {
            //     header.style = "display: block;"
            // }
        viewContainer.style = "display: flex;"
        tabsSection.style = "display: none;"
            // showAllBtn.innerHTML = "Show Tab View"
        leftBtn.style = "display: none;"
        showAllBtn.style = "margin-top: 0px; display:none;"
        rightBtn.style = "display: block; width: 100%; float: none; box-sizing: border-box; text-align: center;"
        rightBtn.innerHTML = "Calculate"
    } else {
        tab1.className = "jtab"
        tab2.className = "jinactive jtab"
        tab2view.style = "display: none;"
        for (let header of headers) {
            header.style = "display: none;"
        }
        viewContainer.style = "display: block;"
        tabsSection.style = "display: flex;"
        showAllBtn.innerHTML = "Show All Input"
        leftBtn.style = "display: block; visibility: hidden; float: left;"
        showAllBtn.style = "margin-top: 65px;"
        rightBtn.style = ""
        rightBtn.innerHTML = "Next"
    }
}

function runCalculation() {
    let initialPayment = parseInt(
        document.getElementById("initialPayment").value
    )
    let glwb = parseInt(document.getElementById("glwb").value) // 0 when income boost, 2 when income control
    let livesCovered = parseInt(document.getElementById("livesCovered").value) // 0 when single life, 1 when joint life
    let currentAge = parseInt(document.getElementById("currentAge").value)
    let ageAtIncome = parseInt(document.getElementById("ageAtIncome").value)

    let withdrawPercent = withdrawMap.get(ageAtIncome)[glwb + livesCovered]
    let deferral = ageAtIncome - currentAge
    let interestPercent = glwb == 0 ? 0.06 : 0.07

    let previousBenefit = initialPayment
    let benefitTable = [] // 2d array
    benefitTable.push([0, initialPayment])

    for (let i = 1; i < 41; i++) {
        if (i < 11) {
            previousBenefit = initialPayment * interestPercent + previousBenefit
        }
        benefitTable.push([i, previousBenefit])
    }

    let withdrawBase = benefitTable[Math.min(deferral, 40)][1]
    let annually = withdrawPercent * withdrawBase
    let monthly = annually / 12
    let percentOfInitial = annually / initialPayment

    let outputHTML = `<table>
        <tr>
            <td>Income Deferral Period</td>
            <td>${deferral} years</td>
        </tr>
        <tr>
            <td>Withdrawal Benefit Base</td>
            <td>${displayDollars(withdrawBase)}</td>
        </tr>
        <tr>
            <td>Annual Withdrawl Percentage</td>
            <td>${displayPercent(withdrawPercent)}</td>
        </tr>
        <tr>
            <td>Annually</td>
            <td>${displayDollars(annually)}</td>
        </tr>
        <tr>
            <td>Monthly</td>
            <td>${displayDollars(monthly)}</td>
        </tr>
        <tr>
            <td>% of Initial Purchase Payment</td>
            <td>${displayPercent(percentOfInitial)}</td>
        </tr>
    </table>`

    document.getElementById("joutput").innerHTML = outputHTML
    document.getElementById("joutput").style = "display: block;"

    let tableHTML = `<table>
  <tr>
    <th>Years</th>
    <th>Benefit</th>
  </tr>
  <tr>`

    for (let row of benefitTable) {
        tableHTML += `<td>${row[0]}</td><td>${displayDollars(
            Math.round(row[1])
        )}</td></tr>`
    }
    tableHTML += "</table>"

    document.getElementById("jtable").innerHTML = tableHTML
    document.getElementById("jtable").style = "display: block;"

}

function switchTab(e) {
    let tab1view = document.getElementById("tab1view")
    let tab2view = document.getElementById("tab2view")
    console.log(e)
    if (e.target.id == "tab1" || e.target.id == "jleftBtn") {
        tab1view.style = "display: inline;"
        tab2view.style = "display: none;"
        tab2.className = "jtab jinactive"
        tab1.className = "jtab"
        rightBtn.innerHTML = "Next"
        leftBtn.style = "visibility: hidden; float: left !important;"
    } else {
        tab2view.style = "display: inline;"
        tab1view.style = "display: none;"
        tab1.className = "jtab jinactive"
        tab2.className = "jtab"
        rightBtn.innerHTML = "Calculate"
        leftBtn.style = "visibility: visible; float: left !important;"
    }
}

function populateMap() {
    for (let i = 55; i < 60; i++) {
        withdrawMap.set(i, [0.035, 0.0285, 0.0375, 0.031])
    }
    for (let i = 60; i < 65; i++) {
        withdrawMap.set(i, [0.0375, 0.031, 0.0425, 0.036])
    }
    for (let i = 65; i < 75; i++) {
        withdrawMap.set(i, [0.05, 0.0435, 0.055, 0.0485])
    }
    for (let i = 75; i < 80; i++) {
        withdrawMap.set(i, [0.0525, 0.046, 0.0575, 0.051])
    }
    for (let i = 80; i < 85; i++) {
        withdrawMap.set(i, [0.055, 0.0485, 0.06, 0.0535])
    }
    for (let i = 85; i < 101; i++) {
        withdrawMap.set(i, [0.0575, 0.051, 0.0625, 0.056])
    }
}

function displayDollars(x) {
    x = Math.round(x * 100) / 100
    return "$" + x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

function displayPercent(x) {
    return (Math.round(x * 100 * 100) / 100).toString() + "%"
}

function addEventListeners() {
    // Support ancient browsers, just in case
    if (rightBtn.addEventListener) {
        rightBtn.addEventListener("click", handleRightBtn)
    } else if (listener.attachEvent) {
        rightBtn.attachEvent("onclick", handleRightBtn)
    }
    if (tab1.addEventListener) {
        tab1.addEventListener("click", switchTab)
    } else if (listener.attachEvent) {
        tab1.attachEvent("onclick", switchTab)
    }
    if (tab2.addEventListener) {
        tab2.addEventListener("click", switchTab)
    } else if (listener.attachEvent) {
        tab2.attachEvent("onclick", switchTab)
    }
    if (leftBtn.addEventListener) {
        leftBtn.addEventListener("click", switchTab)
    } else if (listener.attachEvent) {
        leftBtn.attachEvent("onclick", switchTab)
    }
    if (showAllBtn.addEventListener) {
        showAllBtn.addEventListener("click", showAllInputs)
    } else if (listener.attachEvent) {
        showAllBtn.attachEvent("onclick", showAllInputs)
    }
}