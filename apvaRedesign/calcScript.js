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

addEventListeners()

let initialPayment,
	annualIncome,
	withdrawBase,
	ageAtIncome,
	withdrawPercent,
	bonusRate = 0
let benefitTable = []

function handleNextBtn() {
	clearValues()
	clearErrorMessages()
	let testResults = testValues()

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
	if (solveFor.value == "annual") {
		initialPayment = parseInt(incomeOrInitialPayment.value)
	} else if (solveFor.value == "initial") {
		annualIncome = parseInt(incomeOrInitialPayment.value)
	}

	ageAtIncome = getYoungestAge() + parseInt(yearsDeferred.value)
	withdrawPercent = withdrawMap.get(ageAtIncome)[parseInt(glwb.value) + parseInt(livesCovered.value)]
	bonusRate = parseInt(glwb.value) == 0 ? 0.0625 : 0.0725

	if (solveFor.value == "annual") {
		populateBenefitTable()
		withdrawBase = benefitTable[Math.min(parseInt(yearsDeferred.value), 40)][1]
		annualIncome = withdrawPercent * withdrawBase
	} else if (solveFor.value == "initial") {
		withdrawBase = annualIncome / withdrawPercent
		initialPayment = withdrawBase / (bonusRate * Math.min(10, parseInt(yearsDeferred.value)) + 1)

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

function createActualSummaryTableHTML() {
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
	let currentRowHighlighted = false
	for (let row of benefitTable) {
		if (counter < 11) {
			currentRowHighlighted = false
			let wPercent = "-"
			let bBase = Math.round(row[1])
			let currentAgeDisplayed = getYoungestAge() + counter

			if (currentAgeDisplayed > 54) {
				wPercent = withdrawMap.get(getYoungestAge() + counter)[parseInt(glwb.value) + parseInt(livesCovered.value)]
			}
			if (ageAtIncome == getYoungestAge() + counter || (!rowHighlighted && counter == 10)) {
				returnHTML += "<tr style='background:#F4B860;'>"
				rowHighlighted = true
				currentRowHighlighted = true
			} else {
				returnHTML += "<tr>"
			}
			if (currentRowHighlighted) {
				returnHTML += `
				<td style="border-right: 2px solid #F4B860;">${row[0]}</td>
				<td style="border-right: 2px solid #F4B860;">${currentAgeDisplayed}</td>
				<td style="border-right: 2px solid #F4B860;">${displayDollars(bBase)}</td>
				<td style="border-right: 2px solid #F4B860;">${wPercent == "-" ? "-" : displayDollars(bBase * wPercent)}</td>
				<td>${wPercent == "-" ? "-" : displayPercent(wPercent)}</td>
			</tr>
			`
			} else {
				returnHTML += `
				<td>${row[0]}</td>
				<td>${currentAgeDisplayed}</td>
				<td>${displayDollars(bBase)}</td>
				<td>${wPercent == "-" ? "-" : displayDollars(bBase * wPercent)}</td>
				<td>${wPercent == "-" ? "-" : displayPercent(wPercent)}</td>
			</tr>
			`
			}
		}
		counter++
	}

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
	initialPayment = 0
	annualIncome = 0
	withdrawBase = 0
	ageAtIncome = 0
	withdrawPercent = 0
	bonusRate = 0
	benefitTable = []
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
	// FULL SIZE OF jsPDF using html2canvas IS 596px x 841px. DON'T ASK ME WHY

	let pdfHTML = `
	<div id="page1" style="margin:0; width:596px; height:841px; font-family: helvetica, arial, verdana, sans-serif;">
	`
	pdfHTML += formatPDFSummary("70px")
	// 611 pixels left on page
	pdfHTML += generatePDFPageOne()
	pdfHTML += formatPDFFooter("781px", "1")
	pdfHTML += `
	<div id="page2" style="margin:0; width:596px; height:841px; font-family: helvetica, arial, verdana, sans-serif;">
	`
	pdfHTML += formatPDFSummary("911px")
	pdfHTML += generatePDFPageTwo()

	pdfHTML += formatPDFFooter("1622px", "2")
	pdfHTML += `
	<div id="page3" style="margin:0; width:596px; height:841px; font-family: helvetica, arial, verdana, sans-serif;">
	`
	pdfHTML += generatePDFPageThree()
	pdfHTML += formatPDFFooter("2463px", "3")

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
	<div id="page3content" style="margin:0; padding:20px; display:flex; flex-direction:column; position:absolute; top:1684px; width:556px; height:741px;">
		<p id="page3title" style="font-size:14px; font-weight:700; margin-bottom:20px;">
			Important disclosures
		</p>
		<p style="margin-bottom:${marginBottom}; font-size:${fontSize}; font-weight:300;">
			Withdrawals of taxable amounts are subject to ordinary income tax and, if made before age 59½, may be subject to a 10% federal income tax penalty. 
			Distributions of taxable amounts from a non-qualified annuity may also be subject to an additional 3.8% federal tax on net investment income. 
			Withdrawals will reduce the contract value and may reduce the living and death benefits and any optional riders. Withdrawals may be subject to withdrawal charges. 
			Under current law, a non-qualified annuity that is owned by an individual is generally entitled to tax deferral. IRAs and qualified plans—such as 401(k)s and 403(b)s—are 
			already tax-deferred. Therefore, a deferred annuity should only be used to fund an IRA or qualified plan to benefit from the annuity's features other than tax deferral. 
			These include lifetime income, death benefit options, and the ability to transfer among investment options without sales or withdrawal charges. 
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
			The Accelerator Prime<sup style="font-size:6px;">SM</sup> Variable Annuity is issued by Delaware Life Insurance Company and distributed by its affiliated broker-dealer, 
			Clarendon Insurance Agency, Inc. (member FINRA). Both companies are members of Group One Thousand One, LLC (Group1001).
		</p>
		<p style="margin-bottom:${marginBottom}; font-size:${fontSize}; font-weight:300;">
			Delaware Life Insurance Company, 1601 Trapelo Road, Waltham, MA 02451
		</p>
		<p style="margin-bottom:${marginBottom}; font-size:${fontSize}; font-weight:700;">
			delawarelife.com
		</p>
		<p style="margin-bottom:${marginBottom}; font-size:${fontSize}; font-weight:300;">
			© 2021 Delaware Life Insurance Company. All rights reserved.
		</p>
		<p style="margin-bottom:${marginBottom}; font-size:${fontSize}; font-weight:300;">
			All product guarantees, including optional living and death benefits, are subject to the claims-paying ability and financial strength of the issuing 
			insurance company, and do not protect the value of underlying investment fund options within a variable annuity, which are subject to risk.
		</p>
		<p style="margin-bottom:${marginBottom}; font-size:${fontSize}; font-weight:700;">
			You should carefully consider a variable annuity's risks, charges, limitations, and investment goals of underlying investment options and read all prospectuses 
			prior to making any investment decisions or sending money for your clients. This and other information is available in the product prospectus, as well as the 
			underlying investment option prospectuses. Prospectuses are available from your annuity wholesaler or by calling 844.DEL.SALE (844.335.7253).
		</p>
		<p style="margin-bottom:${marginBottom}; font-size:${fontSize}; font-weight:300;">
			Under current law, a nonqualified annuity that is owned by an individual is generally entitled to tax deferral. IRAs and qualified plans—such as 401(k)s and 
			403(b)s—are already tax deferred. Therefore, a deferred annuity should be used to fund an IRA or qualified plan only to benefit from the annuity's features 
			other than tax deferral. These include lifetime income, death benefit options, and the ability to transfer among investment fund options without sales or withdrawal charges.
		</p>
		<p style="margin-bottom:${marginBottom}; font-size:${fontSize}; font-weight:300;">
			The Income Boost<sup style="font-size:6px;">SM</sup> GLWB fee (1.50%) and Income Control<sup style="font-size:6px;">SM</sup> GLWB fee (1.35%) are calculated based 
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
			<b>Bonus Rate:</b> The GLWB provides a Bonus Rate that may be used in determining increases to the Withdrawal Benefit Base during the Bonus Period. 
			The Bonus Period is in effect until the earlier of the Income Start Date or [10] years from issue.
		</p>
		<p style="margin-bottom:${marginBottom}; font-size:${fontSize}; font-weight:300;">
			Please see the prospectus for a more complete description of the benefits and limitations of the GLWB.
		</p>
	</div>
	`
}

function generatePDFPageTwo() {
	let returnHTML = `
	<div id="page2content" style="margin:0; display:flex; flex-direction:column; position:absolute; top:1091px; width:596px; height:531px; justify-content:center; align-items:center;">
		<table style="font-size:11px; border-collapse: collapse">
			<colgroup>
				<col span="5" style="width:90px;"></col>
			</colgroup>
			<tr>
				<th style="border-right: 2px solid white; padding:5px; color:white; background:#00463b; border-radius:5px 0 0 0;">Year</th>
				<th style="border-right: 2px solid white; padding:5px; color:white; background:#00463b;">Age</th>
				<th style="border-right: 2px solid white; padding:5px; color:white; background:#00463b;">Withdrawal Benefit Base</th>
				<th style="border-right: 2px solid white; padding:5px; color:white; background:#00463b;">Annual Withdrawal Amount</th>
				<th style="padding:5px; color:white; background:#00463b; border-radius:0 5px 0 0;">Lifetime Withdrawal Percent</th>
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
			} else if (counter % 2 == 0) {
				returnHTML += "<tr style='background:#e6e9ed;'>"
			} else {
				returnHTML += "<tr>"
			}
			returnHTML += `
				<td style="text-align:center; padding-top:10px; padding-bottom:10px; border-right: 2px solid white;">${row[0]}</td>
				<td style="text-align:center; padding-top:10px; padding-bottom:10px; border-right: 2px solid white;">${currentAgeDisplayed}</td>
				<td style="text-align:center; padding-top:10px; padding-bottom:10px; border-right: 2px solid white;">${displayDollars(bBase)}</td>
				<td style="text-align:center; padding-top:10px; padding-bottom:10px; border-right: 2px solid white;">${wPercent == "-" ? "-" : displayDollars(bBase * wPercent)}</td>
				<td style="text-align:center; padding-top:10px; padding-bottom:10px;">${wPercent == "-" ? "-" : displayPercent(wPercent)}</td>
			</tr>
			`
		}
		counter++
	}
	returnHTML += `
		</table>
	</div>
	`
	return returnHTML
}

function generatePDFPageOne() {
	let yearOrYears = parseInt(yearsDeferred.value) == 1 ? "year" : "years"
	let percentOfInitial = annualIncome / initialPayment
	let marginTop = "30px"
	return `
	<div id="page1content" style="margin:0; display:flex; flex-direction:column; position:absolute; top:250px; width:596px; height:531px; justify-content:center; align-items:center;">
		<div id="deferralContainer" style="color:white; background:#00463b; border-radius:5px; width:526px; margin:0; margin-top:${marginTop}; display:flex; flex-direction:column; justify-content:center; align-items:center;">
			<div id="deferralTitle" style="font-size:12px; font-weight:700; padding:10px; border-bottom: 1px solid white;">
				Income Deferral Period: ${yearsDeferred.value} ${yearOrYears}
			</div>
			<div id="deferralText" style="font-size:10px; font-weight:300; padding:10px; text-align:center;">
				By deferring when you begin taking income by ${yearsDeferred.value} ${yearOrYears}, (Age ${getYoungestAge()} today, to age ${ageAtIncome}), your Withdrawal Benefit
				Base will grow by a ${displayPercent(bonusRate)} Bonus Rate* for each of those years. When you start income, it will be based off a 
				Withdrawal Benefit Base** of ${displayDollars(withdrawBase)}.
			</div>
		</div>
		<div id="bonusContainer" style="color:white; background:#00463b; border-radius:5px; width:526px; margin:0; margin-top:${marginTop}; display:flex; flex-direction:column; justify-content:center; align-items:center;">
			<div id="bonusTitle" style="font-size:12px; font-weight:700; padding:10px; border-bottom: 1px solid white;">
				Bonus Rate: ${displayPercent(bonusRate)}
			</div>
			<div id="bonusText" style="font-size:10px; font-weight:300; padding:10px; text-align:center;">
				We will calculate a bonus amount during the bonus period that may be added to the Withdrawal Benefit Base.
			</div>
		</div>
		<div id="lifetimeContainer" style="color:white; background:#00463b; border-radius:5px; width:526px; margin:0; margin-top:${marginTop}; display:flex; flex-direction:column; justify-content:center; align-items:center;">
			<div id="lifetimeTitle" style="font-size:12px; font-weight:700; padding:10px; border-bottom: 1px solid white;">
				Lifetime Withdrawal Percentage: ${displayPercent(withdrawPercent)}
			</div>
			<div id="lifetimeText" style="font-size:10px; font-weight:300; padding:10px; text-align:center;">
				This percentage is based off your age of ${ageAtIncome} at the time you start taking income. It is multiplied by the Withdrawal Benefit Base on your Income Start Date
				to determine the amount of annual income you will receive.
			</div>
		</div>
		<div id="annualContainer" style="color:white; background:#00463b; border-radius:5px; width:526px; margin:0; margin-top:${marginTop}; display:flex; flex-direction:column; justify-content:center; align-items:center;">
			<div id="annualTitle" style="font-size:12px; font-weight:700; padding:10px; border-bottom: 1px solid white;">
				Annual Withdrawal Amount: ${displayDollars(annualIncome)}
			</div>
			<div id="annualText" style="font-size:10px; font-weight:300; padding:10px; text-align:center;">
				You are guaranteed to receive this amount of income for life. On an annual basis, this equates to ${displayPercent(percentOfInitial)} of your initial
				purchase payment of ${displayDollars(initialPayment)}.
			</div>
		</div>
		<div id="finePrintContainer" style="font-size:8px; margin-top:auto; margin-bottom:0px;">
			<p>*The Bonus Rate and the Lifetime Withdrawal Percentage are valid for applications signed between TODO: ADD DATES HERE.</p>
			<p>**Early or excess withdrawals will reduce the Withdrawal Benefit Base and Bonus Base by the same proportion that the Account Value is reduced.</p>
			<p>If Joint Life is elected, the covered age is based on the youngest spouse.</p>
			<p>This material must be preceded or accompanied by a current Accelerator Prime Variable Annuity prospectus</p>
		</div>
	</div>
	`
}

function formatPDFFooter(top, pageNum) {
	return `
		<div id="footer" style="width:596px; height:60px; position:absolute; top:${top}; display:flex; flex-direction:column; justify-content:center; align-items:center; font-size:6px; color:#666666; border-top:1px solid #bbbbbb;">
			<p style="margin:0 0 10px 0;">FOR FINANCIAL PROFESSIONALS ONLY. NOT FOR USE WITH THE PUBLIC.</p>
			<p style="margin:0;">${pageNum} / 3</p>
		</div>
	</div>
	`
}

function formatPDFSummary(top) {
	let today = new Date()
	let dateStr = today.getMonth() + 1 + "/" + today.getDate() + "/" + today.getFullYear()
	return `
	<div id="bigBanner" style="margin:0; position:absolute; display:flex; flex-direction:column; width:596px; height:70px; background:#00463b; color:white; font-size:14px; font-weight:700; justify-content:center; align-items:center;">
			<p style="margin:0;">Delaware Life Accelerator Prime<sup style="font-size:8px;">SM</sup> Variable Annuity</p>
			<p style="margin:0;">Guaranteed Lifetime Withdrawal Benefit (GLWB) Income Summary</p>
		</div>
		<div id="summaryBoxContainer" style="position:absolute; top:${top}; margin:10px; display:flex; justify-content:center; width:556px; height: 140px; padding:10px; background:#e6e9ed;">
			<div id="summaryTitle" style="position: absolute; top:20px; left:20px; font-size:10px; font-weight:700;">
				Summary
			</div>
			<div id="third1" style="display:flex; flex-direction:column; margin-right:30px; justify-content:center;">
				<div>
					<p style="font-size:8px; font-weight:700; display:inline;">GLWB/Lives Covered: </p>
					<p style="font-size:8px; font-weight:200; display:inline;">${createGlwbAndLivesCoveredString()}</p>
				</div>
				<div>
					<p style="font-size:8px; font-weight:700; display:inline;">Initial Purchase Payment: </p>
					<p style="font-size:8px; font-weight:200; display:inline;">${displayDollars(initialPayment)}</p>
				</div>
				<div>
					<p style="font-size:8px; font-weight:700; display:inline;">Annual Withdrawal Amount: </p>
					<p style="font-size:8px; font-weight:200; display:inline;">${displayDollars(annualIncome)}</p>
				</div>
			</div>
			<div id="third2" style="display:flex; flex-direction:column; margin-right:30px; justify-content:center;">
				<div>
					<p style="font-size:8px; font-weight:700; display:inline;">Today's Date: </p>
					<p style="font-size:8px; font-weight:200; display:inline;">${dateStr}</p>					
				</div>
				<div>
					<p style="font-size:8px; font-weight:700; display:inline;">Bonus Rate: </p>
					<p style="font-size:8px; font-weight:200; display:inline;">${displayPercent(bonusRate)}</p>					
				</div>
				<div>
					<p style="font-size:8px; font-weight:700; display:inline;">Income Deferral Period: </p>
					<p style="font-size:8px; font-weight:200; display:inline;">${yearsDeferred.value}</p>					
				</div>
				<div>
					<p style="font-size:8px; font-weight:700; display:inline;">Lifetime Withdrawal Percentage: </p>
					<p style="font-size:8px; font-weight:200; display:inline;">${displayPercent(withdrawPercent)}</p>					
				</div>
			</div>
			<div id="third3" style="display:flex; flex-direction:column; justify-content:center;">
				<div>
					<p style="font-size:8px; font-weight:700; display:inline;">State: </p>
					<p style="font-size:8px; font-weight:200; display:inline;">${state.value}</p>					
				</div>
				<div>
					<p style="font-size:8px; font-weight:700; display:inline;">Current Age: </p>
					<p style="font-size:8px; font-weight:200; display:inline;">${currentAge.value}</p>					
				</div>
				<div>
					<p style="font-size:8px; font-weight:700; display:inline;">Spouse Age: </p>
					<p style="font-size:8px; font-weight:200; display:inline;">${parseInt(livesCovered.value) == 0 ? "N/A" : spouseAge.value}</p>					
				</div>
				<div>
					<p style="font-size:8px; font-weight:700; display:inline;">Age at Income Start: </p>
					<p style="font-size:8px; font-weight:200; display:inline;">${ageAtIncome}</p>					
				</div>
			</div>
		</div>
	`
}
