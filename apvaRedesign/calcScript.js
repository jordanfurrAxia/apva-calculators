let withdrawMap = new Map()
populateMap()

let testBtn = document.getElementById("testBtn")
let nextBtn = document.getElementById("nextBtn")
let solveFor = document.getElementById("solveFor")
let livesCovered = document.getElementById("livesCovered")
let incomeOrInitialPayment = document.getElementById("incomeOrInitialPayment")
let incomeOrInitialPaymentLbl = document.getElementById("incomeOrInitialPaymentLbl")
let incomeOrInitialPaymentError = document.getElementById("incomeOrInitialPaymentError")
let currentAge = document.getElementById("currentAge")
let currentAgeError = document.getElementById("currentAgeError")
let spouseAge = document.getElementById("spouseAge")
let spouseAgeError = document.getElementById("spouseAgeError")
let yearsDeferred = document.getElementById("yearsDeferred")
let yearsDeferredError = document.getElementById("yearsDeferredError")
let spouseAgeDiv = document.getElementById("spouseAgeDiv")
let glwb = document.getElementById("glwb")
let pdfDiv = document.getElementById("pdf")

addEventListeners()

function handleNextBtn() {
	clearErrorMessages()
	let testResults = testValues()

	for (let input of testResults) {
		if (input[0] != "v") {
			giveWarning(testResults)
			return
		}
	}

	if (isAnnualWithdrawTooHigh()) {
		giveWarning([["incomeOrInitialPayment", "'Annual Withdrawal Amount' too large."]])
		return
	}

	runCalculation()
}

function isAnnualWithdrawTooHigh() {
	// solveFor.value == "initial" in this function, always
	// need: withdrawPercent
	let annualIncome = parseInt(incomeOrInitialPayment.value)
	let bonusRate = parseInt(glwb.value) == 0 ? 0.0625 : 0.0725
	let ageAtIncome = getYoungestAge() + parseInt(yearsDeferred.value)
	let withdrawPercent = withdrawMap.get(ageAtIncome)[parseInt(glwb.value) + parseInt(livesCovered.value)]
	let withdrawBase = annualIncome / withdrawPercent
	let initialPayment = withdrawBase / (bonusRate * Math.min(10, parseInt(yearsDeferred.value)) + 1)
	if (initialPayment > 3000000) {
		return true
	}
	return false
}

function runCalculation() {
	let initialPayment = 0
	let annualIncome = 0
	let withdrawBase = 0
	let benefitTable = []
	if (solveFor.value == "annual") {
		initialPayment = parseInt(incomeOrInitialPayment.value)
	} else if (solveFor.value == "initial") {
		annualIncome = parseInt(incomeOrInitialPayment.value)
	}

	let ageAtIncome = getYoungestAge() + parseInt(yearsDeferred.value)
	let withdrawPercent = withdrawMap.get(ageAtIncome)[parseInt(glwb.value) + parseInt(livesCovered.value)]
	let bonusRate = parseInt(glwb.value) == 0 ? 0.0625 : 0.0725

	if (solveFor.value == "annual") {
		populateBenefitTable(initialPayment, bonusRate, benefitTable)
		withdrawBase = benefitTable[Math.min(parseInt(yearsDeferred.value), 40)][1]
		annualIncome = withdrawPercent * withdrawBase
	} else if (solveFor.value == "initial") {
		withdrawBase = annualIncome / withdrawPercent
		initialPayment = withdrawBase / (bonusRate * Math.min(10, parseInt(yearsDeferred.value)) + 1)

		populateBenefitTable(initialPayment, bonusRate, benefitTable)
	}

	// let monthly = annualIncome / 12
	// let percentOfInitial = annualIncome / initialPayment

	let summaryTableHTML = createSummaryTableHTML(initialPayment, annualIncome, ageAtIncome, bonusRate, withdrawPercent)
	let actualSummaryTableHTML = createActualSummaryTableHTML(benefitTable, initialPayment, annualIncome, ageAtIncome, bonusRate, withdrawPercent)

	document.getElementById("summaryTable").innerHTML = summaryTableHTML
	document.getElementById("actualSummaryTable").innerHTML = actualSummaryTableHTML
	document.getElementById("summaryContents").classList.remove("j-summary-slide-in")
	setTimeout(function () {
		document.getElementById("summaryContents").classList.add("j-summary-slide-in")
	}, 3)
	document.getElementById("footer").classList.add("move-down-for-summary")
}

function createActualSummaryTableHTML(benefitTable, ageAtIncome) {
	let returnHTML = `<table style="border-collapse: collapse;">
	<tr>
	  <th>Year</th>
	  <th>Age</th>
	  <th>Withdrawal Benefit Base</th>
	  <th>Annual Withdrawal Amount</th>
	  <th>Lifetime Withdrawal Percentage</th>
	</tr>
	`

	let counter = 0
	let rowHighlighted = false
	for (let row of benefitTable) {
		if (counter < 11) {
			let wPercent = "-"
			let bBase = Math.round(row[1])
			let currentAgeDisplayed = getYoungestAge() + counter

			if (currentAgeDisplayed > 54) {
				wPercent = withdrawMap.get(getYoungestAge() + counter)[parseInt(glwb.value) + parseInt(livesCovered.value)]
			}
			if (ageAtIncome == getYoungestAge() + counter || (!rowHighlighted && counter == 10)) {
				returnHTML += "<tr style='background:#F4B860;'>"
				rowHighlighted = true
			} else {
				returnHTML += "<tr>"
			}
			returnHTML += `
				<td>${row[0]}</td>
				<td>${currentAgeDisplayed}</td>
				<td>${displayDollars(bBase)}</td>
				<td>${wPercent == "-" ? "-" : displayDollars(bBase * wPercent)}</td>
				<td>${wPercent == "-" ? "-" : displayPercent(wPercent)}</td>
			</tr>
			`
		}
		counter++
	}

	return returnHTML
}

function createSummaryTableHTML(initialPayment, annualIncome, ageAtIncome, bonusRate, withdrawPercent) {
	let returnHTML = `
	<div class="j-third-flex">
		<div class="j-summary-table-element">
			<p class="j-bold-font">GLWB/Lives Covered:  </p>
			<p>${createGlwbAndLivesCoveredString()}</p>
		</div>
		<div class="j-summary-table-element">
			<p class="j-bold-font">Initial Purchase Payment:  </p>
			<p>${displayDollars(initialPayment)}</p>			
		</div>
		<div class="j-summary-table-element">
			<p class="j-bold-font">Annual Withdrawal Amount:  </p>
			<p>${displayDollars(annualIncome)}</p>
		</div>
	</div>
	<div class="j-third-flex">
		<div class="j-summary-table-element">
			<p class="j-bold-font">Bonus Rate:  </p>
			<p>${displayPercent(bonusRate)}</p>
		</div>
		<div class="j-summary-table-element">
			<p class="j-bold-font">Years Income is Deferred:  </p>
			<p>${parseInt(yearsDeferred.value)}</p>
		</div>
		<div class="j-summary-table-element">
			<p class="j-bold-font">Lifetime Withdrawal Percentage:  </p>
			<p>${displayPercent(withdrawPercent)}</p>
		</div>	
	</div>
	<div class="j-third-flex">
		<div class="j-summary-table-element">
			<p class="j-bold-font">Client's Current Age:  </p>
			<p>${parseInt(currentAge.value)}</p>
		</div>
	`
	if (parseInt(livesCovered.value) == 1) {
		returnHTML += `
		<div class="j-summary-table-element">
			<p class="j-bold-font">Spouse's Current Age:  </p>
			<p>${parseInt(spouseAge.value)}</p>
		</div>
		`
	}

	returnHTML += `
		<div class="j-summary-table-element">
			<p class="j-bold-font">Age at Income Start:  </p>
			<p>${ageAtIncome}</p>
		</div>
	</div>
	`

	return returnHTML
}

function populateBenefitTable(initialPayment, bonusRate, benefitTable) {
	let previousBenefit = initialPayment
	benefitTable.push([0, initialPayment])

	for (let i = 1; i < 41; i++) {
		if (i < 11) {
			previousBenefit = initialPayment * bonusRate + previousBenefit
		}
		benefitTable.push([i, previousBenefit])
	}
}

function getYoungestAge() {
	if (parseInt(livesCovered.value) == 0) {
		// livesCoveredStr = "Single Life"
		return parseInt(currentAge.value)
	} else {
		// livesCoveredStr = "Joint Life"

		return Math.min(parseInt(spouseAge.value), parseInt(currentAge.value))
	}
}

function createGlwbAndLivesCoveredString() {
	let glwbStr = ""
	let livesCoveredStr = ""
	// glwb == 0 when income boost; 2 when income control
	if (parseInt(glwb.value) == 0) {
		glwbStr = "Income Boost"
	} else {
		glwbStr = "Income Control"
	}
	if (parseInt(livesCovered.value) == 0) {
		livesCoveredStr = "Single Life"
	} else {
		livesCoveredStr = "Joint Life"
	}
	return glwbStr + "/" + livesCoveredStr
}

// testValues validates the values inputted by the user. returns a 2D array
function testValues() {
	// returnArray indices represent:
	// 0 = income or initial payment
	// 1 = current age
	// 2 = spouse's age
	// 3 = years deferred
	// values of ["v", "v"] mean that those values are valid
	let returnArray = [
		["v", "v"],
		["v", "v"],
		["v", "v"],
		["v", "v"],
	]
	returnArray[0] = testIncomeOrInitialPaymentValues()
	returnArray[1] = testCurrentAgeValues()
	returnArray[2] = testSpouseAgeValues()
	returnArray[3] = testYearsDeferredValues()

	return returnArray
}

function testIncomeOrInitialPaymentValues() {
	let returnArray = ["v", "v"]

	if (solveFor.value == "annual") {
		if (!incomeOrInitialPayment.value || parseInt(incomeOrInitialPayment.value) < 6000 || parseInt(incomeOrInitialPayment.value) > 3000000) {
			returnArray = ["incomeOrInitialPayment", "'Initial Purchase Payment' must be between 6000 and 3,000,000."]
		}
	} else {
		// solveFor == 'initial' in this case
		if (!incomeOrInitialPayment.value || parseInt(incomeOrInitialPayment.value) < 200) {
			returnArray = ["incomeOrInitialPayment", "'Annual Withdrawal Amount' must be at least 200."]
		}
	}

	return returnArray
}

function testCurrentAgeValues() {
	let returnArray = ["v", "v"]

	if (parseInt(glwb.value) == 0) {
		// glwb == 0 when income boost; 2 when income control
		if (!currentAge.value || parseInt(currentAge.value) < 45 || parseInt(currentAge.value) > 80) {
			returnArray = ["currentAge", "'Current Age' must be between 45 and 80."]
		}
	} else {
		// glwb == 2 == 'income control' in this case
		if (!currentAge.value || parseInt(currentAge.value) < 55 || parseInt(currentAge.value) > 80) {
			returnArray = ["currentAge", "'Current Age' must be between 55 and 80."]
		}
	}

	return returnArray
}

function testSpouseAgeValues() {
	let returnArray = ["v", "v"]

	if (parseInt(livesCovered.value) == 1) {
		if (parseInt(glwb.value) == 0) {
			// glwb == 0 when income boost; 2 when income control
			if (!spouseAge.value || parseInt(spouseAge.value) < 45 || parseInt(spouseAge.value) > 80) {
				returnArray = ["spouseAge", "'Spouse's Current Age' must be between 45 and 80."]
			}
		} else {
			// glwb == 2 == 'income control' in this case
			if (!spouseAge.value || parseInt(spouseAge.value) < 55 || parseInt(spouseAge.value) > 80) {
				returnArray = ["spouseAge", "'Spouse's Current Age' must be between 55 and 80."]
			}
		}
	}

	return returnArray
}

function testYearsDeferredValues() {
	let returnArray = ["v", "v"]

	if (!yearsDeferred.value || parseInt(yearsDeferred.value) < 0 || parseInt(yearsDeferred.value) > 50) {
		returnArray = ["yearsDeferred", "'Years Income is Deferred' must be between 0 and 50."]
	} else {
		// input range is valid
		let incomeStartAge = parseInt(yearsDeferred.value) + getYoungestAge()
		if (!incomeStartAge || incomeStartAge < 55 || incomeStartAge > 100) {
			returnArray = ["yearsDeferred", "Attained age at income start must be between 55 and 100."]
			console.log(incomeStartAge)
		}
	}

	return returnArray
}

function clearErrorMessages() {
	incomeOrInitialPaymentError.innerHTML = ""
	currentAgeError.innerHTML = ""
	spouseAgeError.innerHTML = ""
	yearsDeferredError.innerHTML = ""
}

function handleSolveFor() {
	if (solveFor.value && solveFor.value == "annual") {
		incomeOrInitialPaymentLbl.innerHTML = "Initial Purchase Payment: <sup>*</sup>"
	} else {
		incomeOrInitialPaymentLbl.innerHTML = "Annual Withdrawal Amount: <sup>*</sup>"
	}
}

function handleLivesCovered() {
	if (livesCovered.value && parseInt(livesCovered.value) == 1) {
		spouseAgeDiv.style.display = "flex"
	} else {
		spouseAgeDiv.style.display = "none"
	}
}

function giveWarning(testResults) {
	let badInputElement = null
	let errorMessage = null

	for (let input of testResults) {
		if (input[0] != "v") {
			badInputElement = input[0]
			errorMessage = input[1]
		}
		if (badInputElement) {
			let varString = badInputElement + "Error"
			console.log(badInputElement)
			console.log(varString)
			eval(varString + '.innerHTML = "' + errorMessage + '"')
		}
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
	return "$" + x.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

function displayPercent(x) {
	return (Math.round(x * 100 * 100) / 100).toFixed(2) + "%"
}

function addEventListeners() {
	if (nextBtn.addEventListener) {
		nextBtn.addEventListener("click", handleNextBtn)
	} else if (listener.attachEvent) {
		nextBtn.attachEvent("onclick", handleNextBtn)
	}
	if (solveFor.addEventListener) {
		solveFor.addEventListener("click", handleSolveFor)
	} else if (listener.attachEvent) {
		solveFor.attachEvent("onclick", handleSolveFor)
	}
	if (livesCovered.addEventListener) {
		livesCovered.addEventListener("click", handleLivesCovered)
	} else if (listener.attachEvent) {
		livesCovered.attachEvent("onclick", handleLivesCovered)
	}
	if (clientReportBtn.addEventListener) {
		clientReportBtn.addEventListener("click", handleClientReport)
	} else if (listener.attachEvent) {
		clientReportBtn.attachEvent("onclick", handleClientReport)
	}
}

function handleClientReport() {
	// FULL WIDTH OF jsPDF using html2canvas IS 596px. DON'T ASK ME WHY
	let tableTest = `
	<table style="margin-left: 100px;">
		<tr>
			<td>A1</td>
			<td>B1</td>
		</tr>
		<tr>
			<td>A2</td>
			<td>B2</td>
		</tr>
	</table>
	`
	let divTest = `
	<div style="margin:0; background:red; font-weight:500; width:596px;">
		red background; bold text; margin 0
	</div>
	<div style="background:black; color:white; width:596px;">
		some really long text blah blah let's make the text really long to see if it wraps or overflows I need it to be quite a bit longer please and thank you supercalifragilisticexpialidocius
	</div>
	`
	let doc = new jsPDF({ hotfixes: ["px_scaling"], unit: "pt" })
	doc.html(divTest, {
		// doc.html(tableTest, {
		callback: function (doc) {
			doc.save("a4.pdf")
		},
		x: 0,
		y: 0,
	})
}
