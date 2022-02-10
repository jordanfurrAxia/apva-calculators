let withdrawMap = new Map()
populateMap()

let testBtn = document.getElementById("testBtn")
let clientReportBtn = document.getElementById("clientReportBtn")
let nextBtn = document.getElementById("nextBtn")
let solveFor = document.getElementById("solveFor")
let state = document.getElementById("state")
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

// let accentColor = "#0a0d42" // DL dark blue
let accentColor = "#00463b" // DL APVA green
let accentColorLight = "#00b89c"
let greyColor = "#e6e9ed"

addEventListeners()

let stateVal = ""
let initialPayment,
	annualIncome,
	withdrawBase,
	ageAtIncome,
	withdrawPercent,
	bonusRate,
	glwbVal,
	livesCoveredVal,
	currentAgeVal,
	spouseAgeVal,
	solveForVal,
	deferred = 0
let benefitTable = []

function handleNextBtn() {
	clearValues()
	storeUserInput()
	clearErrorMessages()
	let testResults = validateInput()

	for (let input of testResults) {
		if (input[0] != "v") {
			giveWarning(testResults)
			return
		}
	}

	runCalculation()

	if (initialPayment > 3000000) {
		giveWarning([["incomeOrInitialPayment", "'Annual Withdrawal Amount' too large."]])
		return
	}

	displaySummary()
}

function runCalculation() {
	ageAtIncome = getYoungestAge() + deferred
	withdrawPercent = withdrawMap.get(ageAtIncome)[glwbVal + livesCoveredVal]
	bonusRate = glwbVal == 0 ? 0.06 : 0.07

	if (solveForVal == "annual") {
		populateBenefitTable()
		withdrawBase = benefitTable[Math.min(deferred, 40)][1]
		annualIncome = withdrawPercent * withdrawBase
	} else if (solveForVal == "initial") {
		withdrawBase = annualIncome / withdrawPercent
		initialPayment = withdrawBase / (bonusRate * Math.min(10, deferred) + 1)

		populateBenefitTable()
	}
}

function displaySummary() {
	let summaryTableHTML = createSummaryTableHTML()
	let actualSummaryTableHTML = createActualSummaryTableHTML()

	document.getElementById("summaryTable").innerHTML = summaryTableHTML
	document.getElementById("actualSummaryTable").innerHTML = actualSummaryTableHTML
	document.getElementById("summaryContents").classList.remove("j-summary-and-footer-container-slide")
	document.getElementById("footer").classList.remove("j-summary-and-footer-container-slide")
	document.getElementById("summaryTableContainer").classList.remove("j-summary-show")
	setTimeout(function () {
		document.getElementById("summaryContents").classList.add("j-summary-and-footer-container-slide")
		document.getElementById("footer").classList.add("j-summary-and-footer-container-slide")
		document.getElementById("summaryTableContainer").classList.add("j-summary-show")
	}, 3)
}

function storeUserInput() {
	stateVal = state.value
	solveForVal = solveFor.value
	if (solveForVal == "annual") {
		initialPayment = getIncomeOrInitialInt()
	} else if (solveForVal == "initial") {
		annualIncome = getIncomeOrInitialInt()
	}
	glwbVal = parseInt(glwb.value)
	livesCoveredVal = parseInt(livesCovered.value)
	currentAgeVal = parseInt(currentAge.value)
	if (livesCoveredVal == 1) {
		//joint life selected. otherwise spouseAgeVal stays at 0
		spouseAgeVal = parseInt(spouseAge.value)
	}
	deferred = parseInt(yearsDeferred.value)
}

function createActualSummaryTableHTML(forPDF = false) {
	let pdfPadding = "8px"
	let returnHTML = `<table style="${forPDF ? "font-size:11px;" : ""}border-collapse: collapse;">`
	if (forPDF) {
		returnHTML += `
		<colgroup>
			<col span="5" style="width:110px;"></col>
 		</colgroup>
		`
	}
	returnHTML += `
	<tr>
	  <th${forPDF ? ' style="border-right: 2px solid white; padding:10px; color:white; background:' + accentColor + '; border-radius:5px 0 0 0;"' : ""}>Years Deferred</th>
	  <th${forPDF ? ' style="border-right: 2px solid white; padding:10px; color:white; background:' + accentColor + ';"' : ""}>Age at Income Start</th>
	  <th${forPDF ? ' style="border-right: 2px solid white; padding:10px; color:white; background:' + accentColor + ';"' : ""}>Withdrawal Benefit Base</th>
	  <th${forPDF ? ' style="border-right: 2px solid white; padding:10px; color:white; background:' + accentColor + ';"' : ""}>Annual Withdrawal Amount</th>
	  <th${forPDF ? ' style="padding:10px; color:white; background:' + accentColor + '; border-radius:0 5px 0 0;"' : ""}>Lifetime Withdrawal Percentage</th>
	</tr>
	`

	let counter = 0
	let evenOddCounter = 0
	let rowHighlighted = false
	for (let row of benefitTable) {
		if (!rowHighlighted) {
			let wPercent = "-"
			let bBase = Math.round(row[1])
			let currentAgeDisplayed = getYoungestAge() + counter

			if (counter > 9 && deferred > 10) {
				let groupYoungAge = getYoungestAge() + counter
				let groupOldAge = groupYoungAge
				let prevWPercent = withdrawMap.get(getYoungestAge() + counter)[glwbVal + livesCoveredVal]
				let yearLow = counter
				wPercent = withdrawMap.get(getYoungestAge() + counter)[glwbVal + livesCoveredVal]
				do {
					if (getYoungestAge() + counter < 100) {
						counter++
						groupOldAge++
						prevWPercent = withdrawMap.get(getYoungestAge() + counter)[glwbVal + livesCoveredVal]
					} else {
						break
					}
				} while (groupOldAge < 100 && prevWPercent == withdrawMap.get(getYoungestAge() + counter + 1)[glwbVal + livesCoveredVal])
				if (ageAtIncome <= getYoungestAge() + counter) {
					returnHTML += "<tr style='background:#F4B860;'>"
					rowHighlighted = true
				} else if (forPDF && evenOddCounter % 2 == 0) {
					returnHTML += `<tr style='background:${greyColor};'>`
				} else {
					returnHTML += "<tr>"
				}
				if (forPDF) {
					returnHTML += `
						<td style="text-align:center; padding:${pdfPadding}; border-right: 2px solid white;">${yearLow + " - " + counter}</td>
						<td style="text-align:center; padding:${pdfPadding}; border-right: 2px solid white;">${groupYoungAge + " - " + groupOldAge}</td>
						<td style="text-align:center; padding:${pdfPadding}; border-right: 2px solid white;">${displayDollars(bBase)}</td>
						<td style="text-align:center; padding:${pdfPadding}; border-right: 2px solid white;">${displayDollars(bBase * wPercent)}</td>
						<td style="text-align:center; padding:${pdfPadding};">${displayPercent(wPercent)}</td>
					</tr>
					`
				} else {
					returnHTML += `
						<td${rowHighlighted ? ' style="border-right: 2px solid white;"' : ""}>${yearLow + " - " + counter}</td>
						<td${rowHighlighted ? ' style="border-right: 2px solid white;"' : ""}>${groupYoungAge + " - " + groupOldAge}</td>
						<td${rowHighlighted ? ' style="border-right: 2px solid white;"' : ""}>${displayDollars(bBase)}</td>
						<td${rowHighlighted ? ' style="border-right: 2px solid white;"' : ""}>${displayDollars(bBase * wPercent)}</td>
						<td>${displayPercent(wPercent)}</td>
					</tr>
					`
				}
			} else {
				if (currentAgeDisplayed > 54) {
					wPercent = withdrawMap.get(getYoungestAge() + counter)[glwbVal + livesCoveredVal]
				}
				if (ageAtIncome == getYoungestAge() + counter) {
					returnHTML += "<tr style='background:#F4B860;'>"
					rowHighlighted = true
				} else if (forPDF && evenOddCounter % 2 == 0) {
					returnHTML += `<tr style='background:${greyColor};'>`
				} else {
					returnHTML += "<tr>"
				}
				if (forPDF) {
					returnHTML += `
						<td style="text-align:center; padding:${pdfPadding}; border-right: 2px solid white;">${row[0]}</td>
						<td style="text-align:center; padding:${pdfPadding}; border-right: 2px solid white;">${currentAgeDisplayed}</td>
						<td style="text-align:center; padding:${pdfPadding}; border-right: 2px solid white;">${displayDollars(bBase)}</td>
						<td style="text-align:center; padding:${pdfPadding}; border-right: 2px solid white;">${wPercent == "-" ? "-" : displayDollars(bBase * wPercent)}</td>
						<td style="text-align:center; padding:${pdfPadding};">${wPercent == "-" ? "-" : displayPercent(wPercent)}</td>
					</tr>
					`
				} else {
					returnHTML += `
						<td${rowHighlighted ? ' style="border-right: 2px solid white;"' : ""}>${row[0]}</td>
						<td${rowHighlighted ? ' style="border-right: 2px solid white;"' : ""}>${currentAgeDisplayed}</td>
						<td${rowHighlighted ? ' style="border-right: 2px solid white;"' : ""}>${displayDollars(bBase)}</td>
						<td${rowHighlighted ? ' style="border-right: 2px solid white;"' : ""}>${wPercent == "-" ? "-" : displayDollars(bBase * wPercent)}</td>
						<td>${wPercent == "-" ? "-" : displayPercent(wPercent)}</td>
					</tr>
					`
				}
			}

			evenOddCounter++
			if (getYoungestAge() + counter < 100) {
				counter++
			} else {
				break
			}
		}
	}
	returnHTML += "</table>"

	return returnHTML
}

function createSummaryTableHTML() {
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
			<p>${deferred}</p>
		</div>
		<div class="j-summary-table-element">
			<p class="j-bold-font">Lifetime Withdrawal Percentage:  </p>
			<p>${displayPercent(withdrawPercent)}</p>
		</div>	
	</div>
	<div class="j-third-flex">
		<div class="j-summary-table-element">
			<p class="j-bold-font">Client's Current Age:  </p>
			<p>${currentAgeVal}</p>
		</div>
	`
	if (livesCoveredVal == 1) {
		returnHTML += `
		<div class="j-summary-table-element">
			<p class="j-bold-font">Spouse's Current Age:  </p>
			<p>${spouseAgeVal}</p>
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

function populateBenefitTable() {
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
	if (livesCoveredVal == 0) {
		// livesCoveredStr = "Single Life"
		return currentAgeVal
	} else {
		// livesCoveredStr = "Joint Life"
		return Math.min(spouseAgeVal, currentAgeVal)
	}
}

function createGlwbAndLivesCoveredString() {
	let glwbStr = ""
	let livesCoveredStr = ""
	// glwb == 0 when income boost; 2 when income control
	if (glwbVal == 0) {
		glwbStr = "Income Boost"
	} else {
		glwbStr = "Income Control"
	}
	if (livesCoveredVal == 0) {
		livesCoveredStr = "Single Life"
	} else {
		livesCoveredStr = "Joint Life"
	}
	return glwbStr + "/" + livesCoveredStr
}

function validateInput() {
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

	if (solveForVal == "annual") {
		if (!incomeOrInitialPayment.value || getIncomeOrInitialInt() < 6000 || getIncomeOrInitialInt() > 3000000) {
			returnArray = ["incomeOrInitialPayment", "'Initial Purchase Payment' must be between 6000 and 3,000,000."]
		}
	} else {
		// solveFor == 'initial' in this case
		if (!incomeOrInitialPayment.value || getIncomeOrInitialInt() < 200) {
			returnArray = ["incomeOrInitialPayment", "'Annual Withdrawal Amount' must be at least 200."]
		}
	}

	return returnArray
}

function testCurrentAgeValues() {
	let returnArray = ["v", "v"]

	if (glwbVal == 0) {
		// glwb == 0 when income boost; 2 when income control
		if (!currentAge.value || currentAgeVal < 45 || currentAgeVal > 80) {
			returnArray = ["currentAge", "'Current Age' must be between 45 and 80."]
		}
	} else {
		// glwb == 2 == 'income control' in this case
		if (!currentAge.value || currentAgeVal < 55 || currentAgeVal > 80) {
			returnArray = ["currentAge", "'Current Age' must be between 55 and 80."]
		}
	}

	return returnArray
}

function testSpouseAgeValues() {
	let returnArray = ["v", "v"]

	if (livesCoveredVal == 1) {
		if (glwbVal == 0) {
			// glwb == 0 when income boost; 2 when income control
			if (!spouseAge.value || spouseAgeVal < 45 || spouseAgeVal > 80) {
				returnArray = ["spouseAge", "'Spouse's Current Age' must be between 45 and 80."]
			}
		} else {
			// glwb == 2 == 'income control' in this case
			if (!spouseAge.value || spouseAgeVal < 55 || spouseAgeVal > 80) {
				returnArray = ["spouseAge", "'Spouse's Current Age' must be between 55 and 80."]
			}
		}
	}

	return returnArray
}

function testYearsDeferredValues() {
	let returnArray = ["v", "v"]

	if (!yearsDeferred.value || deferred < 0 || deferred > 50) {
		returnArray = ["yearsDeferred", "'Years Income is Deferred' must be between 0 and 50."]
	} else {
		// input range is valid
		let incomeStartAge = deferred + getYoungestAge()
		if (!incomeStartAge || incomeStartAge < 55 || incomeStartAge > 100) {
			returnArray = ["yearsDeferred", "Attained age at income start must be between 55 and 100."]
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

function clearValues() {
	stateVal = ""
	initialPayment = 0
	annualIncome = 0
	withdrawBase = 0
	ageAtIncome = 0
	withdrawPercent = 0
	bonusRate = 0
	deferred = 0
	glwbVal = 0
	livesCoveredVal = 0
	currentAgeVal = 0
	spouseAgeVal = 0
	benefitTable = []
}

function handleSolveFor() {
	if (solveFor.value == "annual") {
		incomeOrInitialPaymentLbl.innerHTML = "Initial Purchase Payment: <sup>*</sup>"
	} else {
		incomeOrInitialPaymentLbl.innerHTML = "Annual Withdrawal Amount: <sup>*</sup>"
	}
}

function handleLivesCovered() {
	if (parseInt(livesCovered.value) == 1) {
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

function getIncomeOrInitialInt() {
	let dollarStr = incomeOrInitialPayment.value
	if (dollarStr == "$NaN") {
		return 0
	}
	dollarStr = dollarStr.replace(/[^\d.-]/g, "")
	return parseInt(dollarStr)
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
	if (incomeOrInitialPayment.addEventListener) {
		incomeOrInitialPayment.addEventListener("change", handleIncomeOrInitalChange)
	} else if (listener.attachEvent) {
		incomeOrInitialPayment.attachEvent("onchange", handleIncomeOrInitalChange)
	}
}

function handleIncomeOrInitalChange() {
	let userInput = incomeOrInitialPayment.value
	userInput = userInput.replace(/[^\d.-]/g, "") //removes any character that isn't a number while preserving decimal points
	incomeOrInitialPayment.value = displayDollars(userInput)
}

function handleClientReport() {
	// FULL SIZE OF jsPDF using html2canvas IS 596px x 841px. DON'T ASK ME WHY

	let pdfHTML = `
	<div id="page1" style="margin:0; width:596px; height:841px; font-family: helvetica, arial, verdana, sans-serif;">
	`
	pdfHTML += formatPDFSummary("110px")
	pdfHTML += generatePDFPageOne()
	pdfHTML += `
	<div id="page2" style="margin:0; width:596px; height:841px; font-family: helvetica, arial, verdana, sans-serif;">
	`
	pdfHTML += formatPDFSummary("951px")
	pdfHTML += generatePDFPageTwo()
	pdfHTML += `
	<div id="page3" style="margin:0; width:596px; height:841px; font-family: helvetica, arial, verdana, sans-serif;">
	`
	pdfHTML += generatePDFPageThree()

	let today = new Date()
	let dateStr = today.getMonth() + 1 + "." + today.getDate() + "." + today.getFullYear() + "_" + today.getHours() + "." + today.getMinutes()
	let doc = new jsPDF({ hotfixes: ["px_scaling"], unit: "pt" })
	doc.html(pdfHTML, {
		callback: function () {
			doc.save(`APVA_Summary ${dateStr}.pdf`)
		},
		x: 0,
		y: 0,
	})
}

function generatePDFPageThree() {
	let fontSize = "9px"
	let marginBottom = "0px"
	return `
	<div id="page3content" style="margin:0; padding:20px; display:flex; flex-direction:column; position:absolute; top:1674px; width:556px; height:831px;">
		<p id="page3title" style="font-size:14px; font-weight:700; margin-bottom:20px;">
			Important disclosures
		</p>
		<p style="margin-bottom:${marginBottom}; font-size:${fontSize}; font-weight:700;">
			You should carefully consider a variable annuity's risks, charges, limitations, and investment goals of underlying investment options and read all 
			prospectuses prior to making any investment decisions or sending money for your clients. This and other information is available in the product prospectus, 
			as well as the underlying investment option prospectuses. Prospectuses are available from your annuity wholesaler or by calling 844.DEL.SALE (844.335.7253).
		</p>
		<p style="margin-bottom:${marginBottom}; font-size:${fontSize}; font-weight:300;">
		Withdrawals of taxable amounts are subject to ordinary income tax and, if made before age 59½, may be subject to a 10% federal income tax penalty. 
		Distributions of taxable amounts from a non-qualified annuity may also be subject to an additional 3.8% federal tax on net investment income. 
		Withdrawals will reduce the contract value and may reduce the living and death benefits and any optional riders. Withdrawals may be subject to withdrawal charges. 
		Under current law, a non-qualified annuity that is owned by an individual is generally entitled to tax deferral. IRAs and qualified plans—such as 401(k)s and 
		403(b)s—are already tax-deferred. Therefore, a deferred annuity should only be used to fund an IRA or qualified plan to benefit from the annuity's features other 
		than tax deferral. These include lifetime income, death benefit options, and the ability to transfer among investment options without sales or withdrawal charges.
		</p>
		<p style="margin-bottom:${marginBottom}; font-size:${fontSize}; font-weight:300;">
			Products, riders, and features may vary by state, may not be available in all states, and their numbers may vary by state. 
			Ask your financial professional for more information. This brochure is a general description of the product.
		</p>
		<p style="margin-bottom:${marginBottom}; font-size:${fontSize}; font-weight:300;">
			Delaware Life does not provide tax or legal advice. Any tax discussion is for general informational purposes only. 
			Clients should refer to their tax advisor for advice about their specific situation.
		</p>
		<p style="margin-bottom:${marginBottom}; font-size:${fontSize}; font-weight:300;">
			The Accelerator Prime Variable Annuity is issued by Delaware Life Insurance Company and distributed by its affiliated broker-dealer, 
			Clarendon Insurance Agency, Inc. (member FINRA). Both companies are members of Group One Thousand One, LLC (Group1001).
		</p>
		<p style="margin-bottom:${marginBottom}; font-size:${fontSize}; font-weight:300;">
			Delaware Life Insurance Company, 1601 Trapelo Road, Waltham, MA 02451
		</p>
		<p style="margin-bottom:${marginBottom}; font-size:${fontSize}; font-weight:700;">
			delawarelife.com
		</p>
		<p style="margin-bottom:${marginBottom}; font-size:${fontSize}; font-weight:300;">
			© 2022 Delaware Life Insurance Company. All rights reserved.
		</p>
		<p style="margin-bottom:${marginBottom}; font-size:${fontSize}; font-weight:300;">
			All product guarantees, including optional living and death benefits, are subject to the claims-paying ability and financial strength of the issuing 
			insurance company, and do not protect the value of underlying investment fund options within a variable annuity, which are subject to risk.
		</p>
		<p style="margin-bottom:${marginBottom}; font-size:${fontSize}; font-weight:300;">
			The Income Boost GLWB fee (1.50%) and Income Control GLWB fee (1.35%) are calculated based 
			on the withdrawal benefit base, charged at the end of each quarter, and deducted proportionately from the contract value. The rider fee percentage could be 
			increased as a result of a step-up. Delaware Life will notify you in advance, 
			and you can elect not to receive the step-up. The GLWB fee will never be greater than the set maximum GLWB fee.
		</p>
		<p style="margin-bottom:${marginBottom}; font-size:${fontSize}; font-weight:300;">
			The <b>Annual Withdrawal Amount</b> is a hypothetical value until the Income Start Date. The Annual Withdrawal Amount is determined by multiplying 
			the Withdrawal Benefit Base by the applicable Lifetime Withdrawal Percentage. The Annual Withdrawal Amount is not cumulative, i.e., if you do not take the 
			full withdrawal in one year, the amount not withdrawn does not carry over to increase the Annual Withdrawal Amount in future years.
		</p>
		<p style="margin-bottom:${marginBottom}; font-size:${fontSize}; font-weight:300;">
			The <b>Withdrawal Benefit Base</b> is the amount used to determine the Annual Withdrawal Amount. It is equal to your initial purchase payment, decreased 
			by Early or Excess withdrawals, and increased by any applicable bonuses, step-ups, and additional purchase payments. The Withdrawal Benefit Base is 
			NOT a cash value, surrender value, or death benefit. It is not available for withdrawal.
		</p>
		<p style="margin-bottom:${marginBottom}; font-size:${fontSize}; font-weight:300;">
			The <b>Lifetime Withdrawal Percentage</b> is used to calculate the Annual Withdrawal amount. For single coverage, the Lifetime Withdrawal Percentage 
			is based on the age of the contract owner at the time of the first withdrawal after age 55. For joint life /spousal coverage, the percentage is 
			based on the youngest spouse's age at the time of the first withdrawal after age 55.
		</p>
		<p style="margin-bottom:${marginBottom}; font-size:${fontSize}; font-weight:300;">
			The <b>Bonus Rate:</b> The GLWB provides a Bonus Rate that may be used in determining increases to the Withdrawal Benefit Base during the Bonus Period. 
			The Bonus Period is in effect until the earlier of the Income Start Date or 10 years from issue.
		</p>
		<p style="margin-bottom:${marginBottom}; font-size:${fontSize}; font-weight:300;">
			Please see the prospectus for a more complete description of the benefits and limitations of the GLWB.
		</p>
		<p style="margin-bottom:${marginBottom}; font-size:${fontSize}; font-weight:300;">
			This material is approved for use between an advisor and their client or prospect. It should not be distributed to the general public.
		</p>
		<p style="margin-bottom:${marginBottom}; font-size:${fontSize}; font-weight:300;">
			XXXXXXXXX XX/XX/XXXX
		</p>
		<p style="font-size:8px; margin-bottom:0; margin-top:auto; padding-bottom:10px; align-self:center; color:#444444;">
			Page 3/3
		</p>
	</div>
	
	</div>
	`
}

function generatePDFPageTwo() {
	let returnHTML = `
	<div id="page2content" style="margin:0; display:flex; flex-direction:column; position:absolute; top:1101px; width:596px; height:583px; justify-content:center; align-items:center;">
		<div id="tableContainer" style="padding:20px 0 20px 0;">
	`
	returnHTML += createActualSummaryTableHTML(true)
	returnHTML += `
			</div>
			<div id="finePrintContainer" style="gap:7px; padding:0 24px 0 24px; font-size:8px; display:flex; flex-direction:column; justify-content:center; margin:0 0 auto 0;">
				<p style="margin:0;">
					The row highlighted in orange represents the year income is turned on based on the client information provided. These values correspond with the 
					values used on the previous page. Rows that are not highlighted in orange represent the annual income amount that would be guaranteed if the client 
					elected to turn on income in those years.
				</p>
				<p style="margin:0;">
					<strong>Please Note:</strong> This summary is not designed to provide a quote and assumes no withdrawals have been taken prior to the Income Start Date.
				</p>
				
			</div>
			<p style="font-size:8px; margin:10px; align-self:center; color:#444444;">
				Page 2/3
			</p>
			
		</div>
	</div>
	`
	return returnHTML
}

function generatePDFPageOne() {
	let yearOrYears = deferred == 1 ? "year" : "years"
	let percentOfInitial = annualIncome / initialPayment
	let totalAnnualWithdrawals = annualIncome * (100 - ageAtIncome + 1)
	let today = new Date()
	let dateStr = today.getMonth() + 1 + "/" + today.getDate() + "/" + today.getFullYear()
	let marginTop = "37px"
	let titlePadding = "8px 10px 8px 10px"
	let titleFontSize = "14px"
	let detailsFontSize = "11px"
	let returnStr = `
	<div id="page1content" style="margin:0; display:flex; flex-direction:column; position:absolute; top:250px; width:596px; height:591px; justify-content:center; align-items:center;">
		<div id="initialContainer" style="width:526px; margin:0; margin-top:50px; display:flex; flex-direction:column; justify-content:center; align-items:center;">
			<div id="initialTitle" style="background:${accentColor}; position:absolute; top:33px; left:30px; color:white; border-radius:6px; font-size:${titleFontSize}; font-weight:700; padding:${titlePadding}; border-bottom: 1px solid white;">
				Initial Purchase Payment: <span style="font-weight:200;">${displayDollars(initialPayment)}</span>
			</div>
			<div id="initialText" style="background:${greyColor}; font-size:${detailsFontSize}; width:556px; margin:0 10px 0 10px; font-weight:300; padding:20px 10px 10px 10px;">
				At issue, your Withdrawal Benefit Base<sup style="font-size:7px;">1</sup> will be equal to your Initial Purchase Payment.
			</div>
		</div>
		<div id="bonusContainer" style="border-radius:5px; width:526px; margin:0; margin-top:${marginTop}; display:flex; flex-direction:column; justify-content:center; align-items:center;">
			<div id="bonusTitle" style="border-radius:6px; color:white; background:${accentColor}; position:absolute; top:113px; left:30px; font-size:${titleFontSize}; font-weight:700; padding:${titlePadding}; border-bottom: 1px solid white;">
				Bonus Rate<sup style="font-size:9px;">2</sup>: <span style="font-weight:200;">${displayPercent(bonusRate)}</span>
			</div>
			<div id="bonusText" style="background:${greyColor}; font-size:${detailsFontSize}; width:556px; margin:0 10px 0 10px; font-weight:300; padding:20px 10px 10px 10px;">
				This is the rate we use to calculate a bonus amount during the bonus period. This amount is added to the Withdrawal Benefit Base each year income is deferred. 
				If you elect to begin lifetime income immediately, your Withdrawal Benefit Base will not be increased by a bonus amount.
			</div>
		</div>
		<div id="deferralContainer" style="width:526px; margin:0; margin-top:${marginTop}; display:flex; flex-direction:column; justify-content:center; align-items:center;">
			<div id="deferralTitle" style="background:${accentColor}; position:absolute; top:216px; left:30px; color:white; border-radius:6px; font-size:${titleFontSize}; font-weight:700; padding:${titlePadding}; border-bottom: 1px solid white;">
				Income Deferral Period: <span style="font-weight:200;">${deferred} ${yearOrYears}</span>
			</div>
			<div id="deferralText" style="background:${greyColor}; font-size:${detailsFontSize}; width:556px; margin:0 10px 0 10px; font-weight:300; padding:20px 10px 10px 10px;">
				By deferring when you begin taking income by <strong>${deferred} ${yearOrYears}</strong>, (Age <strong>${getYoungestAge()}</strong> today, 
				to age <strong>${ageAtIncome}</strong>), your Withdrawal Benefit Base will have increased to <strong>${displayDollars(withdrawBase)}</strong>. 
				When you start income, it will be based off this amount.
			</div>
		</div>
		<div id="lifetimeContainer" style="border-radius:5px; width:526px; margin:0; margin-top:${marginTop}; display:flex; flex-direction:column; justify-content:center; align-items:center;">
			<div id="lifetimeTitle" style="top:307px; left:30px; border-radius:6px; background:${accentColor}; color:white; font-size:${titleFontSize}; font-weight:700; position:absolute; padding:${titlePadding}; border-bottom: 1px solid white;">
				Lifetime Withdrawal Percentage<sup style="font-size:9px;">2</sup>: <span style="font-weight:200;">${displayPercent(withdrawPercent)}</span>
			</div>
			<div id="lifetimeText" style="background:${greyColor}; font-size:${detailsFontSize}; width:556px; margin:0 10px 0 10px; font-weight:300; padding:20px 10px 10px 10px;">
				This percentage is based off your age of <strong>${ageAtIncome}</strong> at the time you start taking income. It is multiplied by the 
				Withdrawal Benefit Base on your Income Start Date to determine the amount of annual income you will receive.
			</div>
		</div>
		<div id="annualContainer" style="border-radius:5px; width:526px; margin:0; margin-top:${marginTop}; display:flex; flex-direction:column; justify-content:center; align-items:center;">
			<div id="annualTitle" style="top:398px; left:30px; border-radius:6px; background:${accentColor}; color:white; font-size:${titleFontSize}; font-weight:700; position:absolute; padding:${titlePadding}; border-bottom: 1px solid white;">
				Annual Withdrawal Amount: <span style="font-weight:200;">${displayDollars(annualIncome)}</span>
			</div>
			<div id="annualText" style="background:${greyColor}; font-size:${detailsFontSize}; width:556px;margin:0 10px 0 10px; font-weight:300; padding:20px 10px 10px 10px;">
				You are guaranteed to receive this amount of annual income for life. On an annual basis, this equates to <strong>${displayPercent(percentOfInitial)}</strong> 
				of an initial purchase payment of <strong>${displayDollars(initialPayment)}</strong>. If you live to age 100, your total annual 
				withdrawals will amount to <strong>${displayDollars(totalAnnualWithdrawals)}</strong>.
			</div>
		</div>
		<div id="finePrintContainer" style="gap:7px; padding:0 20px 0 20px; font-size:8px; display:flex; flex-direction:column; justify-content:center; margin-top:auto; margin-bottom:0px;">
			<p style="margin:0;">
				<sup>1</sup>Early or excess withdrawals will reduce the Withdrawal Benefit Base and Bonus Base by the same proportion that the Account Value is reduced. 
				This summary assumes that no withdrawals have been taken prior to the Income Start Date.
			</p>
			<p style="margin:0;"><sup>2</sup>The Bonus Rate and the Lifetime Withdrawal Percentage are valid for applications signed on ${dateStr}.</p>
	`
	if (livesCoveredVal == 1) {
		returnStr += `<p style="margin:0;"><strong>Please Note:</strong> When Joint Life is elected, the covered age is based on the youngest spouse.</p>`
	}

	returnStr += `
			</div>
			<p style="font-size:8px; margin:10px; align-self:center; color:#444444;">
				Page 1/3
			</p>
		</div>
	</div>
	`

	return returnStr
}

function formatPDFSummary(top) {
	let fontSize = "9px"
	let logoTop = (parseInt(top.slice(0, -2)) - 95).toString() + "px"
	let logoNameTop = (parseInt(logoTop.slice(0, -2)) - 4).toString() + "px"
	let yearOrYears = deferred == 1 ? "year" : "years"
	let today = new Date()
	let dateStr = today.getMonth() + 1 + "/" + today.getDate() + "/" + today.getFullYear()
	let returnStr = `
	<div id="bigBanner" style="margin:0; position:absolute; display:flex; flex-direction:column; width:596px; height:110px; background:${accentColor}; color:white; font-size:14px; font-weight:700;">
		<p style="margin:65px 0 0 15px; font-weight:200;">Delaware Life Accelerator Prime<sup style="font-size:8px;">SM</sup> Variable Annuity</p>
		<p style="margin:0 0 0 15px;">Guaranteed Lifetime Withdrawal Benefit (GLWB) Income Summary</p>
	</div>
	<div id="logoContainer" style="display:flex; position:absolute; top:${logoTop}; left:15px;">
		<div id="circle" style="background:white; height:26px; width:26px; border-radius:100%; margin-top:12px;"></div>
		<div id="rectangle" style="background:${accentColorLight}; height:38px; width:13px;"></div>
	</div>
	<div id="logoNameContainer" style="display:flex; flex-direction:column; position:absolute; top:${logoNameTop}; left:63px; color:white; font-size:20px; font-weight:700;">
		<div>
			Delaware
		</div>
		<div>
			Life<sup style="font-size:8px;"> ®</sup>
		</div>
	</div>
	<div id="summaryBoxContainer" style="position:absolute; top:${top}; margin:10px; display:flex; justify-content:center; width:556px; height: 120px; padding:10px; background:${greyColor};">
		<div id="summaryTitle" style="position: absolute; top:12px; left:20px; font-size:13px; font-weight:700;">
			Summary
		</div>
		<div id="third1" style="display:flex; flex-direction:column; margin-right:30px; justify-content:center;">
			<div>
				<p style="font-size:${fontSize}; font-weight:700; display:inline;">Today's Date: </p>
				<p style="font-size:${fontSize}; font-weight:200; display:inline;">${dateStr}</p>					
			</div>
			<div>
				<p style="font-size:${fontSize}; font-weight:700; display:inline;">GLWB/Lives Covered: </p>
				<p style="font-size:${fontSize}; font-weight:200; display:inline;">${createGlwbAndLivesCoveredString()}</p>
			</div>
			<div>
				<p style="font-size:${fontSize}; font-weight:700; display:inline;">Initial Purchase Payment: </p>
				<p style="font-size:${fontSize}; font-weight:200; display:inline;">${displayDollars(initialPayment)}</p>
			</div>
			<div>
				<p style="font-size:${fontSize}; font-weight:700; display:inline;">Annual Withdrawal Amount: </p>
				<p style="font-size:${fontSize}; font-weight:200; display:inline;">${displayDollars(annualIncome)}</p>
			</div>
		</div>
		<div id="third2" style="display:flex; flex-direction:column; margin-right:30px; justify-content:center;">
			<div>
				<p style="font-size:${fontSize}; font-weight:700; display:inline;">State: </p>
				<p style="font-size:${fontSize}; font-weight:200; display:inline;">${stateVal}</p>					
			</div>
			<div>
				<p style="font-size:${fontSize}; font-weight:700; display:inline;">Bonus Rate: </p>
				<p style="font-size:${fontSize}; font-weight:200; display:inline;">${displayPercent(bonusRate)}</p>					
			</div>
			<div>
				<p style="font-size:${fontSize}; font-weight:700; display:inline;">Income Deferral Period: </p>
				<p style="font-size:${fontSize}; font-weight:200; display:inline;">${deferred} ${yearOrYears}</p>					
			</div>
			<div>
				<p style="font-size:${fontSize}; font-weight:700; display:inline;">Lifetime Withdrawal Percentage: </p>
				<p style="font-size:${fontSize}; font-weight:200; display:inline;">${displayPercent(withdrawPercent)}</p>					
			</div>
		</div>
		<div id="third3" style="display:flex; flex-direction:column; justify-content:center;">
			<div>
				<p style="font-size:${fontSize}; font-weight:700; display:inline; color:${greyColor};">A</p>
			</div>
			<div>
				<p style="font-size:${fontSize}; font-weight:700; display:inline;">Age at Income Start: </p>
				<p style="font-size:${fontSize}; font-weight:200; display:inline;">${ageAtIncome}</p>					
			</div>
			<div>
				<p style="font-size:${fontSize}; font-weight:700; display:inline;">Current Age: </p>
				<p style="font-size:${fontSize}; font-weight:200; display:inline;">${currentAgeVal}</p>					
			</div>
	`
	if (livesCoveredVal == 1) {
		returnStr += `
			<div>
				<p style="font-size:${fontSize}; font-weight:700; display:inline;">Spouse's Age: </p>
				<p style="font-size:${fontSize}; font-weight:200; display:inline;">${spouseAgeVal}</p>					
			</div>
		`
	} else {
		returnStr += `
			<div>
				<p style="font-size:${fontSize}; font-weight:700; display:inline; color:${greyColor};">A</p>
			</div>
		`
	}

	returnStr += `
		</div>
	</div>
	`

	return returnStr
}
