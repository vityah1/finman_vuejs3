<template>
<link crossorigin="anonymous" href="https://use.fontawesome.com/releases/v5.2.0/css/all.css" integrity="sha384-hWVjflwFxL6sNzntih27bfxkr27PmbbK/iSvJ+a4+0owXq79v+lsFkW54bOGbiDQ" rel="stylesheet">
	<div class="container">
		<NavigationMenu />
		<div>
			<router-view :key="$router.fullPath" />
		</div>
	</div>
</template>

<script>
import NavigationMenu from './NavigationMenu.vue';

export default {
	name: "app",
	components: {
		NavigationMenu
	},
};
</script>
