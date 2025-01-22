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
	<footer>
		<div>
			<a href="https://freudenhof.de/?page_id=166">Datenschutz/Impressum</a>
		</div>
	</footer>
</template>

<style>
body {
	--max-body-width: 960px;
}
</style>

<style scoped>
header {
	height: 80px;
	width: 100%;
	box-shadow: 0 1px 13px rgba(0, 0, 0, 0.2);
}
header div {
	max-width: min(var(--max-body-width), calc(100vw - 36px));
	margin: auto;
	display: flex;
	padding: 18px;
}
header .freudenhof_link {
	color: #4499ff;
    font-size: 2.0em;
    font-weight: normal;
    font-style: normal;
    font-family: Segoe Print, Caveat-Regular;
	transition: color 150ms ease-in-out;
}
header .freudenhof_link:hover {
	text-decoration: none;
	color: #95c41f;
}
footer {
	padding: 52px 12px;
	background-color: #222222;
}
footer > div {
	max-width: min(var(--max-body-width), calc(100vw - 36px));
	margin: auto;
}
footer > div a {
	color: #fff;
	font-weight: 300;
}
</style>
