let nextBtn = document.getElementById("nextBtn")
let solveFor = document.getElementById("solveFor")
let livesCovered = document.getElementById("livesCovered")
let incomeOrInitialPayment = document.getElementById("incomeOrInitialPayment")
let incomeOrInitialPaymentLbl = document.getElementById("incomeOrInitialPaymentLbl")
let currentAge = document.getElementById("currentAge")
let spouseAge = document.getElementById("spouseAge")
let yearsDeferred = document.getElementById("yearsDeferred")
let spouseAgeDiv = document.getElementById("spouseAgeDiv")
let glwb = document.getElementById("glwb")

addEventListeners()

function handleNextBtn() {
	let testResults = testValues()

	for (let input of testResults) {
		if (input[0] != "v") {
			console.log("values INVALID")
			giveWarning(testResults)
			return
		}
	}

	console.log("values VALID")
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
	console.log(testResults)
}

function testValues() {
	// returnArray indexes represent:
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

	//if solveFor == annual, min = 6000 and max = 3000000
	if (solveFor.value == "annual") {
		if (!incomeOrInitialPayment.value || parseInt(incomeOrInitialPayment.value) < 6000 || parseInt(incomeOrInitialPayment.value) > 3000000) {
			returnArray[0] = ["incomeOrInitialPayment", "Initial Purchase Payment must be between 6000 and 3,000,000."]
		}
	} else {
		// solveFor == 'initial' in this case
		if (!incomeOrInitialPayment.value || parseInt(incomeOrInitialPayment.value) < 200 || parseInt(incomeOrInitialPayment.value) > 500000) {
			returnArray[0] = ["incomeOrInitialPayment", "Annual Withdrawal Amount must be between 6000 and 500,000."]
		}
	}

	if (parseInt(glwb.value) == 0) {
		// glwb == 0 when income boost; 2 when income control
		if (!currentAge.value || parseInt(currentAge.value) < 45 || parseInt(currentAge.value) > 80) {
			returnArray[1] = ["currentAge", "Current Age must be between 45 and 80."]
		}
	} else {
		// glwb == 2 == 'income control' in this case
		if (!currentAge.value || parseInt(currentAge.value) < 55 || parseInt(currentAge.value) > 80) {
			returnArray[1] = ["currentAge", "Current Age must be between 55 and 80."]
		}
	}

	// livesCovered == 0 == single life; livesCovered == 1 == joint life
	if (parseInt(livesCovered.value) == 1) {
		if (parseInt(glwb.value) == 0) {
			// glwb == 0 when income boost; 2 when income control
			if (!spouseAge.value || parseInt(spouseAge.value) < 45 || parseInt(spouseAge.value) > 80) {
				returnArray[2] = ["spouseAge", "Spouse's Current Age must be between 45 and 80."]
			}
		} else {
			// glwb == 2 == 'income control' in this case
			if (!spouseAge.value || parseInt(spouseAge.value) < 55 || parseInt(spouseAge.value) > 80) {
				returnArray[2] = ["spouseAge", "Spouse's Current Age must be between 55 and 80."]
			}
		}
	}

	//check input range first
	//once input range is valid, check to make sure deferred + currentAge is between 55 and 100 (inclusive)
	if (!yearsDeferred.value || parseInt(yearsDeferred.value) < 0 || parseInt(yearsDeferred.value) > 50) {
		returnArray[3] = ["yearsDeferred", "Years Income is Deferred must be between 0 and 50."]
	} else {
		// input range is valid
		let incomeStartAge = parseInt(yearsDeferred.value) + parseInt(currentAge.value)
		if (!incomeStartAge || incomeStartAge < 55 || incomeStartAge > 100) {
			returnArray[3] = ["yearsDeferred", "Attained age at income start must be between 55 and 100. Please adjust number of Years Income is Deferred."]
			console.log(incomeStartAge)
		}
	}

	return returnArray
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
