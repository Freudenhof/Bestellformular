import type { Product } from "./types";

interface FormData {
    customer_data: {
		name: string,
		message: string,
	},
    date: string
    products: Product[]
    ordered: Product[]
}
function lineify(cells: (string|number)[]): string {
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

export function generateOverviewSheet(data: FormData): string {
    let lines = [
        lineify([data.customer_data.name]),
        lineify([data.date]),
        lineify([data.customer_data.message]),
        '',
    ];

    let ordered_products = data.ordered.slice();

    ordered_products.sort((a, b) => {
        if (a.packorder != b.packorder) return a.packorder-b.packorder;
        return a.group-b.group;
    });

    lines.push(lineify([
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
}

export function generateEmailOrderSheet(data: FormData): string {
    let lines = [
        lineify([data.customer_data.name]),
        lineify([data.date]),
        lineify([data.customer_data.message]),
        '',
    ];

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

    for (let product of data.products) {
        let ignore: boolean = !(product.amount || (product.comment_enabled && product.comment));
        let cells = [
            product.group,
            product.name,
            product.origin,
            product.unit,
            product.price,
            ignore ? '' : product.amount,
            ignore ? '' : product.comment,
            ignore ? '' : product.amount * product.price,
            '',
        ];
        lines.push(lineify(cells));
    }
    return lines.join('\n');
}