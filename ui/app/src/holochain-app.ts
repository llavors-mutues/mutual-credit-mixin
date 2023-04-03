import { transactionRequestsStoreContext, TransactionRequestsStore, TransactionRequestsClient } from 'lib';

import { transactionsStoreContext, TransactionsStore, TransactionsClient } from 'lib';

// Replace 'ligth.css' with 'dark.css' if you want the dark theme
import '@shoelace-style/shoelace/dist/themes/light.css';

import { LitElement, css, html } from 'lit';
import { property, state, customElement } from 'lit/decorators.js';
import { AppAgentWebsocket, AppAgentClient, ActionHash } from '@holochain/client';
import { AsyncStatus, StoreSubscriber } from '@holochain-open-dev/stores';
import { sharedStyles } from '@holochain-open-dev/elements';
import { provide } from '@lit-labs/context';
import { localized, msg } from '@lit/localize';
import {
  Profile,
  ProfilesClient,
  ProfilesStore,
  profilesStoreContext
} from '@holochain-open-dev/profiles';

import '@holochain-open-dev/elements/elements/display-error.js';
import '@holochain-open-dev/profiles/elements/agent-avatar.js';
import '@holochain-open-dev/profiles/elements/profile-prompt.js';
import '@holochain-open-dev/profiles/elements/profile-list-item-skeleton.js';
import '@shoelace-style/shoelace/dist/components/spinner/spinner.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';

type View = { view: 'main' };

@localized()
@customElement('holochain-app')
export class HolochainApp extends LitElement {
  @provide({ context: transactionRequestsStoreContext })
  @property()
  _transactionRequestsStore!: TransactionRequestsStore;

@provide({ context: transactionsStoreContext })
  @property()
  _transactionsStore!: TransactionsStore;

@state() _loading = true;

  @state() _view = { view: 'main' };

  @provide({ context: profilesStoreContext })
  @property()
  _profilesStore!: ProfilesStore;

  _client!: AppAgentClient;

  _myProfile!: StoreSubscriber<AsyncStatus<Profile | undefined>>;

  async firstUpdated() {
    this._client = await AppAgentWebsocket.connect('', 'mututal-credit');

    await this.initStores(this._client);

    this._loading = false;
  }

  async initStores(appAgentClient: AppAgentClient) {
    // Don't change this
    this._transactionsStore = new TransactionsStore(new TransactionsClient(appAgentClient, 'mutual_credit'));
    this._transactionRequestsStore = new TransactionRequestsStore(new TransactionRequestsClient(appAgentClient, 'mutual_credit'));
}

  renderMyProfile() {
    switch (this._myProfile.value.status) {
      case 'pending': 
        return html`<profile-list-item-skeleton></profile-list-item-skeleton>`;
      case 'complete':
        const profile = this._myProfile.value.value;
        if (!profile) return html``;
        
        return html`<div
              class="row"
              style="align-items: center;"
              slot="actionItems"
            >
              <agent-avatar
                .agentPubKey=${this._client.myPubKey}
              ></agent-avatar>
              <span style="margin: 0 16px;">${profile?.nickname}</span>
            </div>`;
      case 'error':
        return html`<display-error 
            .headline=${msg("Error fetching the profile")}
            .error=${this._myProfile.value.error.data.data} 
            tooltip
          ></display-error>`;
    }
  }

  // TODO: add here the content of your application
  renderContent() {
    return html``;
  }
  
  renderBackButton() {
    if (this._view.view === 'main') return html``;

    return html`
      <sl-icon-button
        name="arrow-left"
        @click=${() => { this._view = { view: 'main' } } }
      ></sl-icon-button>
    `;
  }

  render() {
    if (this._loading)
      return html`<div
        class="row"
        style="flex: 1; height: 100%; align-items: center; justify-content: center;"
      >
	<sl-spinner style="font-size: 2rem"></sl-spinner>
      </div>`;

    return html`
      <div class="column fill">
        <div
          class="row"
          style="align-items: center; color:white; background-color: var(--sl-color-primary-900); padding: 16px"
        >
          ${this.renderBackButton()}
          <span class="title" style="flex: 1">${msg("Mututal Credit")}</span>

          ${this.renderMyProfile()}
        </div>
        
        <profile-prompt style="flex: 1;">
          ${this.renderContent()}
        </profile-prompt>
      </div>
    `;
  }

  static styles = [
    css`
      :host {
        display: flex;
        flex: 1;
      }
    `,
    sharedStyles,
  ];}
