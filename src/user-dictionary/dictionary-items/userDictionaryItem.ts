export interface IUserDictionaryItem {
    readonly rawValue: string;
    
    compare(value:string): boolean; 
}
