export declare type PlainObject = {
    [key: string]: any;
};
export declare type StoreName = string;
export declare type DocMetadata = {
    data: PlainObject;
    id: string;
    exists: boolean;
    metadata?: PlainObject;
};
