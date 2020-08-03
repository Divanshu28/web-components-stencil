import { h, Component, State, Element, Prop, Watch, Listen } from '@stencil/core'
import { AV_API_KEY } from "../../global/global";

@Component({
    tag: 'gt-stock-price',
    styleUrl: './stock-price.css',
    shadow: true
})
export class StockPrice {
    @Element() el: HTMLElement;
    //initialStockSymbol: string;

    stockInput: HTMLInputElement;

    @State() fetchedPrice: number;
    @State() stockUserInput: string;
    @State() stockInputValid = false;
    @State() error: string;

    @Prop() stockSymbol: string;

    //adding the watcher for the property
    @Watch('stockSymbol')
    stockSymbolChanged(newValue: string, oldValue: string) {
        if( newValue !== oldValue) {
            this.stockUserInput = newValue;
            this.fetchStockPrice(newValue);
        }
    }


    onUserInput(event: Event) {
            this.stockUserInput = (event.target as HTMLInputElement).value;

            if(this.stockUserInput.trim() !== '') {
                this.stockInputValid = true;
            } else {
                this.stockInputValid = false;
            }
    }
    

    onFetchStockPrice(event: Event) {
        event.preventDefault();
        //const stockSymbol = (this.el.shadowRoot.querySelector('#stock-symbol') as HTMLInputElement).value;
        //const stockSymbol = this.stockInput.value;
        const stockSymbol = this.stockUserInput;
        console.log('submitted');
        
        this.fetchStockPrice(stockSymbol)

    }

    componentWillLoad() {
        //right before the component is about to load /render
        console.log('component Will Load');
        console.log(this.stockSymbol);

        //need to make synchronous update to the state

        //this.fetchedPrice = 0;
    }

    componentDidLoad() {
        console.log('component did Load');
        if (this.stockSymbol) {
            //this.initialStockSymbol = this.stockSymbol;
            this.stockUserInput = this.stockSymbol;
            this.stockInputValid = true;
            this.fetchStockPrice(this.stockSymbol)
        }
    }

    componentWillUpdate() {
        console.log('component Will update');
        // if(this.stockSymbol !== this.initialStockSymbol) {
        //     this.fetchStockPrice(this.stockSymbol);
        // }
    }

    componentDidUpdate() {
        console.log('component did update');
        // if(this.stockSymbol !== this.initialStockSymbol) {
        //     this.initialStockSymbol = this.stockSymbol;
        //     this.fetchStockPrice(this.stockSymbol);
        // }
    }

    componentDidUnload() {
        console.log('component did unload');
    }

    @Listen('body: gtSymbolSelected')
    onStockSymbolSelected(event: CustomEvent) {
        if(event.detail && event.detail !== this.stockSymbol) {
    
            this.stockSymbol = event.detail;
        }
    }

    fetchStockPrice(stockSymbol: string) {
        fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stockSymbol}&apikey=${AV_API_KEY}`)
        .then((res) => {
            if(res.status !== 200) {
                throw new Error('Invalid');
            }
            
            return res.json();
        })
        .then((parsedRes) => {
            if(parsedRes['Global Quote']['05. price'])
                this.fetchedPrice = +parsedRes['Global Quote']['05. price'];
        })
        .catch((err) => {
            this.error = err.message;
        });
    }

    render() {

        let dataContent = (<p>Please enter a symbol</p>);

        if(this.error) {
            dataContent = (<p>{this.error}</p>)
        }

        if( this.fetchedPrice ) {
            dataContent = (<p>Price: ${ this.fetchedPrice }</p>)
        }
        return [
            <form onSubmit={this.onFetchStockPrice.bind(this)}>
                <input id="stock-symbol" ref={ el => this.stockInput = el} value={this.stockUserInput} onInput={this.onUserInput.bind(this)}/>
                <button type="submit" disabled={!this.stockInputValid}>Fetch</button>
            </form>,
            <div>
               {dataContent}
            </div>
        ];
    }
}
