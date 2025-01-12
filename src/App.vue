<script setup lang="ts">
import FormularPart from './components/FormularPart.vue'
</script>

<template>
	<header>
		<div>
			<a href="https://freudenhof.de" class="freudenhof_link">Freudenhof</a>
		</div>
	</header>
	<FormularPart />
</template>

<style>
body {
	--max-body-width: 960px;
}
</style>

<style scoped>
header {
	height: 50px;
	width: 100%;
	box-shadow: 0 1px 13px rgba(0, 0, 0, 0.2);
}
header div {
	max-width: var(--max-body-width);
	margin: auto;
	display: flex;
	padding: 8px;
}
header .freudenhof_link {
	font-size: 25px;
}
</style>
