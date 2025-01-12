

<template>
	<content>
		<h1>Bestellformular</h1>

		<p>{{ date }}</p>

		<ul class="product_list">
			<li class="product" v-for="product of products">
				<div class="description">
					<label>{{ product.name }}</label>
					<label>{{ product.origin }}</label>
				</div>
				<div class="price">
					{{ product.price }}
					{{ product.unit }}
				</div>
				<div class="amount">
					<input type="number" min="0" v-model="product.amount">
					{{ product.unit }}
				</div>
				<div class="comment">
					<button @click="product.comment_enabled = true">Bemerkung hinzufügen</button>
					<textarea v-if="product.comment_enabled" v-model="product.comment"></textarea>
				</div>
			</li>
		</ul>
	</content>
	
</template>

<script lang="ts">
import { reactive } from 'vue';

type Data = {
	date: string,
	products: Product[]
};
const data: Data = reactive({
	date: 'initial',
	products: [
	]
});
type Product = {
	name: string
	group: number
	packorder: number
	unit: string
	price: number
	origin: string
	label: string
	amount: number
	comment: string
	comment_enabled: boolean
}

async function parseCSVFile() {
	const response = await fetch('./../preisliste.csv');
	const csv_content = await response.text();
	let lines = csv_content.split(/\n/g);
	
	data.date = lines[11].split(',')[5];

	lines = lines.slice(15);
	for (let line of lines) {
		let cells = line.split(/,/g);
		if (!cells[5]) continue;

		console.log(cells[5])
		const product: Product = {
			packorder: parseInt(cells[3]),
			group: parseInt(cells[4]),
			name: cells[5],
			unit: cells[6],
			price: parseInt(cells[7]),
			origin: cells[8],
			label: cells[9],
			amount: 0,
			comment: '',
			comment_enabled: false,
		}
		data.products.push(product);
	}
}
parseCSVFile();

export default {
	name: 'FormularPart',
	data() {
		return data;
	}
}

</script>

<style scoped>
content {
	max-width: var(--max-body-width);
	display: block;
	margin: auto
}
ul.product_list {
	border-radius: 5px;
	border: 1px solid #ddd;
}
.product {
	display: flex;
	flex-wrap: wrap;
	padding: 10px 10px;
}
.product .description {

}
.product .price {

}
.product .amount {

}
.product .comment {
	width: 100%;
	min-height: 10px;
}
.product .comment > p {
	cursor: pointer;
}


</style>
