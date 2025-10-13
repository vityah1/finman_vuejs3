<template>
	<div class="layout-wrapper">
		<NavigationMenu />
		<div class="layout-main">
			<div class="layout-content">
				<router-view :key="$router.fullPath" />
			</div>
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

<style>
/* Import global design system */
@import './styles/main.css';

.layout-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.layout-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.layout-content {
  flex: 1;
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

@media (min-width: 1400px) {
  .layout-content {
    max-width: 1300px;
  }
}
</style>
