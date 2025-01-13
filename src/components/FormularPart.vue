

<template>
	<content>
		<h1>Bestellformular</h1>

		<p>{{ date }}</p>

		<ul class="product_list">
			<li class="product" v-for="product of products">
				<div class="description">
					<label class="name">{{ product.name }}</label>
					<div class="details">
						<label class="origin">{{ product.origin }}</label>
						
							<img v-if="product.label == 'Bioland'" src="./../assets/bioland.svg" height="40px" />
							<img v-else-if="product.label == 'demeter'" src="./../assets/demeter.svg" height="40px" />
							<img v-else-if="product.label == 'Naturland'" src="./../assets/naturland.svg" height="40px" />
							<label v-else>{{ product.label }}</label>
						
					</div>
				</div>
				<div class="price">
					{{ printPrice(product.price) }} /
					{{ product.unit }}
				</div>
				<div class="amount">
					<input type="number" min="0" step="0.1" v-model="product.amount">
					<label>× {{ product.unit }}</label>
				</div>
				<div class="comment">
					<button @click="product.comment_enabled = !product.comment_enabled" class="simple">
						Bemerkung {{ product.comment_enabled ? 'entfernen' : 'hinzufügen' }}
					</button>
					<textarea v-if="product.comment_enabled" v-model="product.comment" placeholder=""></textarea>
				</div>
			</li>
		</ul>

		<div class="summary">{{ printPrice(sum) }}</div>

		<button @click="order()">Bestellen</button>
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

const CSV_REGEX = /(".*?"|[^",\s]+)(?=\s*,|\s*$)/g;
function readCells(line: string): string[] {
	let in_escaped = false;
	let result: string[] = [];
	let word = '';
	for (let char of line) {
		if (char == '"') {
			in_escaped = !in_escaped;
			continue;
		}
		if (!in_escaped && char == ',') {
			result.push(word);
			word = '';
		} else {
			word += char;
		}
	}
	return result;
}
function parseGermanFloat(input: string): number {
	return parseFloat(input.replace(/,/, '.'));
}

async function parseCSVFile() {
	const response = await fetch('./../preisliste.csv');
	const csv_content = await response.text();
	let lines = csv_content.split(/\n/g);
	
	data.date = readCells(lines[11])[5] ?? '';

	lines = lines.slice(15);
	for (let line of lines) {
		let cells = readCells(line)
		if (!cells[5] || !cells[7]) continue;

		console.log(cells[7], parseGermanFloat(cells[7]))
		const product: Product = {
			packorder: parseInt(cells[3]),
			group: parseInt(cells[4]),
			name: cells[5],
			unit: cells[6],
			price: parseGermanFloat(cells[7]),
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
	},
	computed: {
		sum() {
			let sum = 0;
			for (let product of this.products) {
				sum += product.amount * product.price;
			}
			return sum;
		}
	},
	methods: {
		printPrice(price: number) {
			return price.toFixed(2).replace(/\./, ',') + ' €';
		},
		order() {

		}
	}
}

</script>

<style scoped>
h1 {
	font-size: min(13vw, 38px);
}
content {
	max-width: var(--max-body-width);
	display: block;
	margin: auto
}
ul.product_list {
	border-radius: 5px;
	border: 1px solid var(--color-border);
	margin: 0;
	padding-left: 0;
}
.product {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	padding: 14px 16px;
	border-bottom: 1px solid var(--color-border);
	gap: 6px 10px;
}
.product .description {
	flex-grow: 1;
	width: 400px;
}
.product .description label.name {
	display: block;
}
.product .description .details {
	height: 40px;
	display: flex;
	gap: 16px;
	margin-top: 5px;
	align-items: center;
}
.product .description .details img {
	height: 40px;
}
.product .description label.origin {
	margin-top: 8px;
	display: block;
	color: #78797a;
}
.product .price {
	margin-right: auto;
	font-size: 18px;
	font-weight: 600;
}
.product .amount {
	margin-left: 12px;
}
.product .amount label {
	min-width: 50px;
	flex-grow: 1;
	display: inline-block;
	margin-left: 6px;
}
.product .comment {
	width: 100%;
	min-height: 10px;
}
.product .comment > p {
	cursor: pointer;
}
.product .comment textarea {
	width: 400px;
	min-height: 44px;
	max-width: calc(100% - 20px);
}

.summary {
	float: right;
}


</style>
