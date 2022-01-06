document.addEventListener("DOMContentLoaded", function () {
	var iconMenu = document.querySelector(".menu-text")
	var menuBody = document.querySelector(".menu-body")
	// for mobile collapse menu
	if (iconMenu && menuBody) {
		iconMenu.addEventListener("click", function (e) {
			// for mobile collapse menu
			var content = menuBody
			if (content.style.maxHeight) {
				content.style.maxHeight = null
			} else {
				content.style.maxHeight = content.scrollHeight + "px"
			}
		})
	}
	// var navbar = document.querySelector('.header');
	// var main = document.querySelector('main');
	// var sticky = navbar.offsetTop;
	// // for sticky navbar
	// if (navbar && main) {
	//     window.onscroll = function () {
	//         if (window.pageYOffset > sticky) {
	//             navbar.classList.add("sticky");
	//             main.style.marginTop = navbar.offsetHeight + 'px';
	//         } else {
	//             navbar.classList.remove("sticky");
	//             main.style.marginTop = '0px';
	//         }
	//     };
	// }
})
