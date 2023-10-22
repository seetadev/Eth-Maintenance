export interface AppConfig {
    inputStyle?: string;
    dark?: boolean;
    theme?: string;
    ripple?: boolean;
}

export interface Product {
    id?: string;
    code?: string;
    name?: string;
    description?: string;
    price?: number;
    quantity?: number;
    inventoryStatus?: string;
    category?: string;
    image?: string;
    rating?: number;
}

export enum TargetCondition{
    GT = 'GT', // 
    GTE = 'GTE', // 
    E = "E", // .
    LTE = "LTE", //
    LT ="LT"
}
