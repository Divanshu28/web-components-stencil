import { h, Component, State, Event, EventEmitter } from '@stencil/core'
import {AV_API_KEY} from '../../global/global'

@Component({
    tag: 'gt-stock-finder',
    styleUrl: './stock-finder.css',
    shadow: true
})
export class StockFinder {
    stockNameInput: HTMLInputElement;

    @State() searchResults: {name: string, symbol: string}[] = [];

    @Event({bubbles: true, composed: true}) gtSymbolSelected: EventEmitter<string>;


    onFindStocks(event: Event) {
        event.preventDefault();
        const stockName = this.stockNameInput.value;

        fetch(`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${stockName}&apikey=${AV_API_KEY}`)
        .then((resp) => {
            return resp.json();
        })
        .then((parsedRes) => {
            console.log(parsedRes);
            this.searchResults = parsedRes['bestMatches'].map(match => {
                return {name: match['2. name'], symbol: match['1. symbol'] };
            })
        })
        .catch((err) => {
            console.log(err);
        })
    }

    onSelectSymbol(symbol: string) {
        this.gtSymbolSelected.emit(symbol);
    }
    render() {
        return [
            <form onSubmit={this.onFindStocks.bind(this)}>
            <input id="stock-symbol" ref={ el => this.stockNameInput = el}/>
            <button type="submit">Fetch</button>
        </form>,
            <ul>
                {this.searchResults.map(result => <li onClick={this.onSelectSymbol.bind(this, result.symbol)}>{result.name}</li>)}
            </ul>
        ];
    }
}