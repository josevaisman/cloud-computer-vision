/* globals customElements */

import { LitElement, html } from 'lit-element'
import page from 'page'
import './vision-client-display'
import './vision-client-upload'
import { timeoutPromise } from '../utils/promiseExtension'
// import { clear } from '../tools/datastore'
import VisionClientService from './services/vision-client-service'
// import '@polymer/paper-dialog/paper-dialog.js'
// import { totalInvoice } from '../utils/billing'
import '@polymer/paper-button/paper-button.js'

class VisionClient extends LitElement {
  constructor () {
    super()
    this.page = 'upload'

    this.backendHost = window.location.origin
    if(window.location.hostname === 'localhost' && window.location.port === '3000') {
      this.backendHost = 'http://localhost:9090/https://vision-client-dot-wildlife-247309.appspot.com'
    }

    this.visionClientService = new VisionClientService(this.backendHost)
    this.debug = false
  }

  static get properties () {
    return {
      page: { type: String },
      backendHost: { type: String },
      visionClientService: { type: Object },
      debug: { type: Boolean }
    }
  }

  firstUpdated () {
    // this.billing = totalInvoice()
    page('/', () => {
      this.page = 'display'
    })
    page('/upload', () => {
      this.page = 'upload'
    })
    page()
  }

  renderPage () {
    switch (this.page) {
      case 'display':
        return html`<vision-client-display
                        .visionClientService=${this.visionClientService}
                        ></vision-client-display>`
      case 'upload':
        return html`<vision-client-upload
                        .visionClientService=${this.visionClientService}
                        ></vision-client-upload>`
    }
  }

  render () {
    return html`
    <a href="/"><paper-button raised>Main Page</paper-button></a>
    <a href="/upload"><paper-button raised>upload</paper-button></a>
    <paper-button raised toggles @click=${() => this.debug = !this.debug}>Debug</paper-button>
    ${this.debug ? 
      html`
      Total billing: ${this.billing}
      <a href="/api/frames"><paper-button raised>frames</paper-button></a>
      <a href="/api/videos"><paper-button raised>videos</paper-button></a>
      <a href="/api/predictions"><paper-button raised>predictions</paper-button></a>
      <a href="/api/objects"><paper-button raised>objects</paper-button></a>
      <a href="/api/classes"><paper-button raised>classes</paper-button></a>
      <paper-button raised class="indigo" 
      @click=${() => {
        console.log('fetch')
        timeoutPromise(fetch(`https://${process.env.REGION}-${process.env.PROJECT_ID}.cloudfunctions.net/queue_input`, { mode: 'no-cors' })
        , 1000)
      }
      }>
      Manual Predictions
      </paper-button>
      <a href="/" 
      @click=${() => {
        /*
        return html`
        <paper-dialog>
          <h2>Header</h2>
          <paper-dialog-scrollable>
            Lorem ipsum...
          </paper-dialog-scrollable>
          <div class="buttons">
            <paper-button dialog-dismiss>Cancel</paper-button>
            <paper-button dialog-confirm autofocus>Accept</paper-button>
          </div>
        </paper-dialog>`
        clear('Frame')
        clear('Video')
        clear('Object')
        clear('Prediction')
        clear('Queue')*/
      }}>
      clear database
      </a>
      ` : html``}
    
    
    
      ${this.renderPage()}`
  }
}

customElements.define('vision-client', VisionClient)
