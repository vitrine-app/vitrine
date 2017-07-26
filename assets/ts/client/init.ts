$(document).ready(() => {
	$('#sidebar-container').load('components/SideBar.html');
	$('#game-container').load('components/GameWrapper.html').ready(() => {
		$('#game-cover-container').load('components/GameCover.html');
	});
});
