

<template>
	<div class="content" v-if="stage == 'pick'">
		<h1>Bestellformular</h1>

		<p>Willkommen zu unserem Bestellformular für die Gemüse-Abokiste!</p>
		<p>Dieses Formular richtet sich an Bestandskunden. Wenn Sie als Neukunde an unserer <a href="https://freudenhof.de/?page_id=153" target="_blank">Abokiste</a> Interesse haben, <a href="https://freudenhof.de/?page_id=153">kontaktieren Sie uns!</a></p>
		<p class="date">Bestellung für {{ date }}</p>

		<ul id="product_list">
			<li class="product" :class="{selected: product.amount}" v-for="product of products">
				<div class="description">
					<label class="name">{{ product.name }}</label>
					<div class="details">
						
						<a v-if="product.label == 'Bioland'" href="https://www.bioland.de/verbraucher" target="_blank"><img :title="product.label" src="./../assets/bioland.svg" height="40px" /></a>
						<img :title="product.label" v-else-if="product.label == 'demeter'" src="./../assets/demeter.svg" height="40px" />
						<img :title="product.label" v-else-if="product.label == 'Naturland'" src="./../assets/naturland.svg" height="40px" />
						<img :title="product.label" v-else-if="product.label == 'EG-Bio'" src="./../assets/eg_bio.jpg" height="40px" />
						<label :title="product.label" v-else>{{ product.label }}</label>
						
						<label class="origin">{{ product.origin }}</label>
						
					</div>
				</div>
				<div class="price">
					{{ printPrice(product.price) }} /
					{{ product.unit }}
				</div>
				<div class="amount_wrapper">
					<div class="amount">
						<input type="number" min="0" :step="numberInterval(product)" v-model="product.amount">
						<label>× {{ product.unit }}</label>
					</div>
					<div class="amount_price">
						<template v-if="product.amount">= {{ printPrice(product.amount*product.price) }}</template>
					</div>
				</div>
				<div class="comment">
					<button @click="product.comment_enabled = !product.comment_enabled" class="simple">
						Bemerkung {{ product.comment_enabled ? 'entfernen' : 'hinzufügen' }}
					</button>
					<textarea v-if="product.comment_enabled" v-model="product.comment" placeholder=""></textarea>
				</div>
			</li>
		</ul>

		<div id="order_sum" class="button_bar">
			ca. {{ printPrice(sum) }}
			<button @click="nextPage()">Weiter</button>
		</div>

	</div>
	<div class="content" v-if="stage == 'overview'">
		<h1>Bestellformular</h1>

		<div class="form_bar flex">
			<label>Name</label>
			<input type="text" v-model="customer_data.name">
		</div>
		<div class="form_bar">
			<label>Nachricht (optional)</label>
			<textarea v-model="customer_data.message"></textarea>
		</div>

		<h2>Bestellübersicht</h2>
		<ul id="overview_list" v-if="stage == 'overview'">
			<li v-for="product in ordered">
				<div class="overview_product_name">{{ product.name }}</div>
				<div class="overview_product_origin">{{ product.origin }}</div>
				<div class="overview_product_amount">{{ product.amount + ' ' + product.unit }}</div>
				<div class="overview_product_sum">{{ printPrice(product.amount * product.price) }}</div>
			</li>
			<li>
				<div class="overview_product_extra">Lieferkosten</div>
				<div class="overview_product_sum">{{ printPrice(shipping_base) }}</div>
			</li>
			<li>
				<div class="overview_product_extra">Lieferung Mengenrabatt</div>
				<div class="overview_product_sum">{{ printPrice(shipping_discount) }}</div>
			</li>
		</ul>

		<div id="submit_bar" class="button_bar" v-if="stage == 'overview'">
			<button @click="stage = 'pick'" style="margin-right: auto;">Zurück</button>
			<!--label>Der tatsächliche Preis ergibt sich aus dem abgewogenen Gewicht</label-->
			Vorläufige Summe: {{ printPrice(sum + shipping_base - shipping_discount) }}
			<button @click="order()">Bestellen</button>
		</div>
	</div>

	<div class="content" v-if="stage == 'success'">
		<h1>Bestellformular</h1>

		<p>Ihre Bestellung wurde abgeschickt, vielen Dank!</p>

		<button @click="downloadSheet()">Bestellung Herunterladen</button>
		<label style="margin: 0 10px;">{{ getCSVFilename() }}</label>

		<div class="button_bar">
			<button @click="stage = 'pick'">Zurück zum Formular</button>
		</div>
	</div>

	<div class="content" v-if="stage == 'error'">
		<h1>Bestellformular</h1>

		<p>Beim Abschicken der Bestellung ist ein Fehler aufgetreten...</p>
		<p>Sie können die Bestellung stattdessen als Datei herunterladen, und uns per E-Mail zuschicken!</p>
		<button @click="downloadSheet()">Bestellung Herunterladen</button>
		<label style="margin: 0 10px;">{{ getCSVFilename() }}</label>

		<div class="button_bar">
			<button @click="stage = 'overview'" style="margin-right: auto;">Zurück</button>
		</div>
	</div>
	
</template>

<script lang="ts">
import FileSaver from 'file-saver';
import { reactive } from 'vue';

type Data = {
	date: string,
	stage: 'pick' | 'overview' | 'success' | 'error',
	shipping_base: number,
	customer_data: {
		name: string,
		message: string,
	},
	products: Product[]
};
const data: Data = reactive({
	stage: 'pick',
	date: 'initial',
	shipping_base: 3,
	customer_data: {
		name: '',
		message: '',
	},
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
	var myHeaders = new Headers();
	myHeaders.append('Content-Type','text/plain; charset=UTF-8');
	const response = await fetch('./../preisliste.csv', {headers: myHeaders});
	let buffer = await response.arrayBuffer();
	const decoder = new TextDecoder('iso-8859-1');
    const csv_content = decoder.decode(buffer);
	let lines = csv_content.split(/\n/g);
	
	data.date = readCells(lines[11])[5] ?? '';

	lines = lines.slice(15);
	for (let line of lines) {
		let cells = readCells(line)
		if (!cells[5] || !cells[7] || !cells[8]) continue;

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
	console.log(`Loaded ${data.products.length} products`);
}
parseCSVFile();

export default {
	name: 'FormularPart',
	data() {
		return data;
	},
	computed: {
		ordered() {
			return this.products.filter(product => (product.amount || (product.comment_enabled && product.comment)));
		},
		sum() {
			let sum = 0;
			for (let product of this.products) {
				sum += product.amount * product.price;
			}
			return sum;
		},
		shipping_discount() {
			let range = Math.max(0, this.sum - 20);
			let discount = Math.ceil(range) * 0.1;
			return Math.min(discount, 1);
		}
	},
	methods: {
		numberInterval(product: Product) {
			switch (product.unit) {
				case 'St': return 1;
				case 'Bd': return 1;
				case 'kg': return 0.1;
				case '100g': return 0.1;
				default: 0.1;
			}
		},
		printPrice(price: number) {
			return price.toFixed(2).replace(/\./, ',') + ' €';
		},
		nextPage() {
			if (this.ordered.length) {
				this.stage = 'overview';
				window.scrollTo(0, 0);
			} else {
				alert('Bitte zunächst eine Bestellmenge eingeben.')
			}
		},
		generateOrderSheet(): string {
			let lineify = (cells: (string|number)[]): string => {
				return cells.map(cell => {
					if (typeof cell == 'number') {
						return (Math.round(cell * 10_000) / 10_000).toString();
					}
					if (cell.includes(',')) {
						return `"${cell}"`;
					} else {
						return cell;
					}
				}).join(',');
			}
			let lines = [
				lineify([this.customer_data.name]),
				lineify([this.date]),
				lineify([this.customer_data.message]),
				'',
			];

			let ordered_products = this.ordered.slice();

			ordered_products.sort((a, b) => {
				if (a.packorder != b.packorder) return a.packorder-b.packorder;
				return a.group-b.group;
			});

			lines.push(lineify([
				'Gruppe',
				'Bezeichnung',
				'Herkunft',
				'Einheit',
				'Preis',
				'Menge',
				'Bemerkung',
				'Summe',
			]))
	
			for (let product of ordered_products) {
				let cells = [
					product.group,
					product.name,
					product.origin,
					product.unit,
					product.price,
					product.amount,
					product.comment_enabled ? product.comment : '',
					product.amount * product.price,
					'',
				];
				lines.push(lineify(cells));
			}
			return lines.join('\n');
		},
		getCSVFilename() {
			return `Bestellung ${this.date}.csv`
		},
		order() {
			if (!this.customer_data.name || this.customer_data.name.length < 4) {
				alert('Bitte geben Sie einen Namen ein')
				return;
			}

			let order = this.generateOrderSheet();

			fetch("https://freudenhof.de/register-order/", {
				method: "POST",
				body: JSON.stringify({
					customer_name: this.customer_data.name,
					customer_message: this.customer_data.message,
					order: order,
				}),
				headers: {
					"Content-type": "application/json; charset=UTF-8"
				}
			}).then((response) => {
				response.text().then(console.log)
				this.stage = 'success';
			}).catch(() => {
				this.stage = 'error';
			})
		},
		downloadSheet() {
			let page = this.generateOrderSheet();
			let blob = new Blob([page], {type: 'text/plain;charset=utf-8'});
			FileSaver.saveAs(blob, this.getCSVFilename());
		}
	}
}

</script>

<style scoped>

div.content {
	min-height: calc(100% - 230px);
	max-width: var(--max-body-width);
	display: block;
	margin: auto
}
h1 {
	font-size: min(13vw, 38px);
	font-weight: 500;
    font-kerning: 14px;
    letter-spacing: -1px;
	max-width: min(var(--max-body-width), calc(100vw - 36px));
}

p.date {
	margin-top: 20px;
	text-align: right;
}

.form_bar {
	width: 100%;
	max-width: 500px;
	margin: 6px 0;
}
.form_bar label {
	flex-grow: 1;
}
.form_bar.flex {
	display: flex;
	align-items: center;
}
.form_bar input {
	width: 50%;
}
.form_bar textarea {
	height: 100px;
	width: 100%;
	box-sizing: border-box;
}

ul#product_list {
	border-radius: 5px;
	border: 1px solid var(--color-border);
	margin: 0;
	padding-left: 0;
	overflow: hidden;
}
.product {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	padding: 14px 16px;
	border-bottom: 1px solid var(--color-border);
	border-right: 6px solid transparent;
	gap: 6px 10px;
}
.product:last-child {
	border-bottom: none;
}
.product.selected {
	background-color: var(--color-offwhite);
	border-right: 6px solid green;
}
.product .description {
	flex-grow: 1;
	width: 400px;
}
.product .description label.name {
	display: block;
	font-size: 18px;
	font-weight: 700;
}
.product .description .details {
	height: 40px;
	display: flex;
	gap: 12px;
	margin-top: 5px;
	align-items: center;
}
.product .description .details img {
	height: 40px;
    max-width: 60px;
    object-fit: contain;
}
.product .description label.origin {
	display: block;
	color: #78797a;
}
.product .price {
	margin-right: auto;
	font-size: 18px;
	font-weight: 600;
	margin-bottom: 14px;
}
.product .amount_wrapper {
	margin-left: 12px;
}
.product .amount_price {
	height: 24px;
	margin-bottom: -10px;
	color: #628600;
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


ul#overview_list {
	border-radius: 5px;
	border: 1px solid var(--color-border);
	margin: 0;
	padding-left: 0;
	overflow: hidden;
}
ul#overview_list > li {
	display: flex;
	align-items: center;
	padding: 6px 16px;
	border-bottom: 1px solid var(--color-border);
	gap: 6px 10px;
}
ul#overview_list > li:last-child {
	border-bottom: none;
}
.overview_product_name {
	font-weight: 600;
}
.overview_product_extra {
	flex-grow: 1;
}
.overview_product_origin {
	flex-grow: 1;
    font-size: 13px;
    color: #889;
}
.overview_product_price {
	width: 80px;
}
.overview_product_sum {
	width: 62px;
	text-align: right;
}

.button_bar {
	margin-top: 40px;
	margin-bottom: 60px;
	display: flex;
	justify-content: right;
	gap: 12px;
	align-items: center;
}
#order_sum {
	position: sticky;
    bottom: 8px;
    background: #fff;
    padding: 10px 9px;
    border-radius: 14px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    margin: 38px -9px;
}
#order_sum label {
	margin-right: auto;
}


</style>
