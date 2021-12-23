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

addEventListeners()

function handleNextBtn() {
	clearErrorMessages()
	let testResults = testValues()

	for (let input of testResults) {
		if (input[0] != "v") {
			console.log("values INVALID")
			giveWarning(testResults)
			return
		}
	}
	console.log("values VALID")
	runCalculation()
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

	let ageAtIncome = parseInt(currentAge.value) + parseInt(yearsDeferred.value)
	let withdrawPercent = withdrawMap.get(ageAtIncome)[parseInt(glwb.value) + parseInt(livesCovered.value)]
	let interestPercent = parseInt(glwb.value) == 0 ? 0.06 : 0.07

	if (solveFor.value == "annual") {
		populateBenefitTable(initialPayment, interestPercent, benefitTable)
		withdrawBase = benefitTable[Math.min(parseInt(yearsDeferred.value), 40)][1]
		annualIncome = withdrawPercent * withdrawBase
	} else if (solveFor.value == "initial") {
		withdrawBase = annualIncome / withdrawPercent
		initialPayment = withdrawBase / (interestPercent * Math.min(10, parseInt(yearsDeferred.value)) + 1)

		populateBenefitTable(initialPayment, interestPercent, benefitTable)
	}

	// let monthly = annualIncome / 12
	// let percentOfInitial = annualIncome / initialPayment

	let summaryTableHTML = createSummaryTableHTML(initialPayment, annualIncome, ageAtIncome)

	document.getElementById("summaryTable").innerHTML = summaryTableHTML
	document.getElementById("summaryContents").classList.remove("j-summary-slide-in")
	setTimeout(function () {
		document.getElementById("summaryContents").classList.add("j-summary-slide-in")
	}, 3)
}

function createSummaryTableHTML(initialPayment, annualIncome, ageAtIncome) {
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
			<p>6.00% HC</p>
		</div>
		<div class="j-summary-table-element">
			<p class="j-bold-font">Years Income is Deferred:  </p>
			<p>${parseInt(yearsDeferred.value)}</p>
		</div>
		<div class="j-summary-table-element">
			<p class="j-bold-font">Lifetime Withdrawal Percentage:  </p>
			<p>4.35% HC</p>
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

function populateBenefitTable(initialPayment, interestPercent, benefitTable) {
	let previousBenefit = initialPayment
	benefitTable.push([0, initialPayment])

	for (let i = 1; i < 41; i++) {
		if (i < 11) {
			previousBenefit = initialPayment * interestPercent + previousBenefit
		}
		benefitTable.push([i, previousBenefit])
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
		if (!incomeOrInitialPayment.value || parseInt(incomeOrInitialPayment.value) < 200 || parseInt(incomeOrInitialPayment.value) > 500000) {
			returnArray = ["incomeOrInitialPayment", "'Annual Withdrawal Amount' must be between 200 and 500,000."]
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
		let incomeStartAge = parseInt(yearsDeferred.value) + parseInt(currentAge.value)
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
	return (Math.round(x * 100 * 100) / 100).toString() + "%"
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
}

function testFunc() {
	document.getElementById("summaryTable").classList.remove("j-summary-slide-in")
}
