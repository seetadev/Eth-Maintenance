import { Component } from '@angular/core';

import { List } from '../list/list';
import { MenuPage } from '../menu/menu';
import { InappPurchase } from '../inapp-purchase/inapp-purchase';
import { HomePage } from '../home/home';

@Component({
	templateUrl: 'tabs.html'
})
export class TabsPage {

	tab1Root = HomePage;
	tab2Root = MenuPage;
	tab3Root = List;
	tab4Root = InappPurchase;

	constructor() {

	}
}
