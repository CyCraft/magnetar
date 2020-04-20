export declare type PlainObject = {
    [key: string]: any;
    [key: number]: never;
};
export declare type StoreName = string;
export declare type DocMetadata = {
    data: PlainObject;
    id: string;
    exists: boolean;
    metadata?: PlainObject;
};
