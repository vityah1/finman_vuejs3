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
	mounted() {
		// Логування інформації про версію білда
		console.log('%c🚀 FinMan Version: ' + (process.env.VUE_APP_FULL_VERSION || 'dev'), 'background: #4CAF50; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold');
		console.log('%c📅 Build Time: ' + (process.env.VUE_APP_BUILD_TIME || 'N/A'), 'color: #2196F3; font-weight: bold');
	}
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

/* Mobile optimization */
@media (max-width: 768px) {
  .layout-content {
    padding: 0.5rem;
  }
}

@media (min-width: 1400px) {
  .layout-content {
    max-width: 1300px;
  }
}
</style>
